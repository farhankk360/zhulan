/**
 * fetch-wikidata.ts
 *
 * Build-time script that enriches the structures dataset by querying Wikidata's
 * SPARQL endpoint for Chinese ancient architecture (pre-1911).
 *
 * Run: npx tsx scripts/fetch-wikidata.ts
 * Or:  npm run fetch-data
 */

import * as fs from "node:fs"
import * as path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── PATHS ──────────────────────────────────────────────────────────────────
const CURATED_PATH = path.resolve(__dirname, "../src/data/curated.json")
const DYNASTIES_PATH = path.resolve(__dirname, "../src/data/dynasties.json")
const OUTPUT_PATH = path.resolve(__dirname, "../src/data/structures.json")

// ─── TYPES ──────────────────────────────────────────────────────────────────
type StructureType = "palace" | "residence" | "government" | "bridge"

interface Dynasty {
  name: string
  nameChinese: string
  start: number
  end: number
  color: string
}

interface Structure {
  id: string
  name: string
  nameChinese: string
  type: StructureType
  dynasty: string
  yearBuilt: number
  yearCompleted: number | null
  coordinates: [number, number]
  province: string
  city: string
  status: "complete" | "ruin" | "reconstructed"
  significance: "national" | "regional" | "local"
  source: "curated" | "wikidata"
  tags: string[]
  description?: string
  descriptionChinese?: string
  architect?: string
  architectChinese?: string
  keyFeatures?: string[]
  keyFeaturesChinese?: string[]
  architecturalStyle?: string
  architecturalStyleChinese?: string
  materials?: string[]
  materialsChinese?: string[]
  image?: string
  imageCredit?: string
  sources?: string[]
  aiToolsUsed?: string[]
  wikidataId?: string
  wikimediaImage?: string
  wikipediaUrl?: string
}

// ─── SPARQL QUERY ────────────────────────────────────────────────────────────
const SPARQL_QUERY = `
SELECT DISTINCT
  ?item
  ?itemLabel
  ?itemLabelZh
  ?itemDescription
  ?coord
  ?inception
  ?image
  ?instanceLabel
  ?article
WHERE {
  # Items in China
  ?item wdt:P17 wd:Q148 .

  # Instance of (or subclass of) our target types
  ?item wdt:P31/wdt:P279* ?type .
  VALUES ?type {
    wd:Q16560       # palace
    wd:Q12280       # bridge
    wd:Q11755880    # residential building
    wd:Q3947        # house
    wd:Q16831714    # government building
    wd:Q27686       # public building
    wd:Q32815       # castle / fortified structure (some palaces classified here)
    wd:Q35112127    # Chinese traditional residence
  }

  # Must have coordinates
  ?item wdt:P625 ?coord .

  # Inception date (optional — many structures lack this)
  OPTIONAL { ?item wdt:P571 ?inception . }

  # Image from Wikimedia Commons (optional)
  OPTIONAL { ?item wdt:P18 ?image . }

  # Instance type label (to help classify)
  ?item wdt:P31 ?instance .

  # Chinese label
  OPTIONAL {
    ?item rdfs:label ?itemLabelZh .
    FILTER(LANG(?itemLabelZh) = "zh")
  }

  # Chinese description
  OPTIONAL {
    ?item schema:description ?itemDescriptionZh .
    FILTER(LANG(?itemDescriptionZh) = "zh")
  }

  # English Wikipedia article (optional)
  OPTIONAL {
    ?article schema:about ?item ;
             schema:isPartOf <https://en.wikipedia.org/> .
  }

  # Filter: inception before 1912 (if inception exists)
  FILTER(!BOUND(?inception) || YEAR(?inception) < 1912)

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en,zh" . }
}
LIMIT 500
`

const WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Parse "Point(lng lat)" → [lat, lng] */
function parseCoordinates(point: string): [number, number] | null {
  const match = point.match(
    /Point\(([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)\)/,
  )
  if (!match) return null
  const lng = parseFloat(match[1])
  const lat = parseFloat(match[2])
  if (isNaN(lat) || isNaN(lng)) return null
  return [lat, lng]
}

/** Map instanceLabel to StructureType via keyword matching */
function mapType(instanceLabel: string): StructureType | null {
  const label = instanceLabel.toLowerCase()
  if (label.includes("palace") || label.includes("imperial")) return "palace"
  if (label.includes("bridge") || label.includes("arch")) return "bridge"
  if (
    label.includes("residen") ||
    label.includes("house") ||
    label.includes("dwelling") ||
    label.includes("compound") ||
    label.includes("courtyard") ||
    label.includes("hutong")
  )
    return "residence"
  if (
    label.includes("government") ||
    label.includes("yamen") ||
    label.includes("office") ||
    label.includes("administrative") ||
    label.includes("public")
  )
    return "government"
  return null
}

/** Assign dynasty from yearBuilt using dynasties.json ranges */
function assignDynasty(yearBuilt: number, dynasties: Dynasty[]): string {
  const matches = dynasties.filter(
    (d) => yearBuilt >= d.start && yearBuilt <= d.end,
  )
  if (matches.length === 0) return "Unknown"
  return matches.sort((a, b) => b.start - a.start)[0].name
}

/** Check if a Wikidata entry is within ~0.01 degrees of any curated entry */
function isDuplicate(coords: [number, number], curated: Structure[]): boolean {
  return curated.some((c) => {
    return (
      Math.abs(c.coordinates[0] - coords[0]) < 0.01 &&
      Math.abs(c.coordinates[1] - coords[1]) < 0.01
    )
  })
}

/** Extract Wikidata Q-ID from URI like "http://www.wikidata.org/entity/Q215380" */
function extractQid(uri: string): string {
  const match = uri.match(/Q\d+$/)
  return match ? match[0] : uri
}

interface SparqlBinding {
  value: string
  type: string
  "xml:lang"?: string
}

interface SparqlResult {
  results: {
    bindings: Array<Record<string, SparqlBinding>>
  }
}

// ─── TRANSLATION ─────────────────────────────────────────────────────────────

const DASHSCOPE_KEY = process.env.VITE_DASHSCOPE_KEY ?? ""

/**
 * Translate multiple English descriptions to Chinese in a single Qwen API call.
 * Returns an array of the same length — null entries mean that item failed.
 */
async function translateBatch(texts: string[]): Promise<(string | null)[]> {
  if (!DASHSCOPE_KEY || texts.length === 0) return texts.map(() => null)
  try {
    const numbered = texts.map((t, i) => `${i + 1}. ${t}`).join("\n")
    const res = await fetch(
      "https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DASHSCOPE_KEY}`,
        },
        body: JSON.stringify({
          model: "qwen-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a translator. The user will send numbered English descriptions of Chinese historical structures. " +
                "Translate each to concise Simplified Chinese. " +
                'Respond with ONLY a JSON array of strings in the same order, e.g. ["译文1","译文2"]. ' +
                "No extra text, no markdown.",
            },
            { role: "user", content: numbered },
          ],
        }),
      },
    )
    if (!res.ok) return texts.map(() => null)
    const json = (await res.json()) as {
      choices: Array<{ message: { content: string } }>
    }
    const raw = json.choices?.[0]?.message?.content?.trim() ?? "[]"
    const parsed: unknown = JSON.parse(raw.replace(/^```json|```$/g, "").trim())
    if (!Array.isArray(parsed)) return texts.map(() => null)
    return texts.map((_, i) =>
      typeof parsed[i] === "string" ? (parsed[i] as string) : null,
    )
  } catch {
    return texts.map(() => null)
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Read curated.json
  const curated: Structure[] = JSON.parse(
    fs.readFileSync(CURATED_PATH, "utf-8"),
  )
  console.log(`[fetch-wikidata] Loaded ${curated.length} curated entries`)

  // 2. Read dynasties.json
  const dynasties: Dynasty[] = JSON.parse(
    fs.readFileSync(DYNASTIES_PATH, "utf-8"),
  )
  console.log(`[fetch-wikidata] Loaded ${dynasties.length} dynasties`)

  let wikidataStructures: Structure[] = []

  try {
    // 3. Query Wikidata SPARQL
    console.log("[fetch-wikidata] Querying Wikidata SPARQL...")
    const url = `${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(SPARQL_QUERY)}&format=json`
    const response = await fetch(url, {
      headers: {
        Accept: "application/sparql-results+json",
        "User-Agent":
          "ZhuLan/0.1 (4C Competition 2026; zh-CN ancient architecture visualization)",
      },
    })

    if (!response.ok) {
      throw new Error(
        `SPARQL request failed: ${response.status} ${response.statusText}`,
      )
    }

    const data = (await response.json()) as SparqlResult
    const bindings = data.results.bindings

    if (bindings.length === 0) {
      console.warn(
        "[fetch-wikidata] WARNING: Wikidata returned 0 results. Using curated-only.",
      )
      writeOutput(curated)
      return
    }

    console.log(
      `[fetch-wikidata] Received ${bindings.length} Wikidata bindings`,
    )

    // 4 & 5. Parse and map results
    const seen = new Set<string>()
    const unmappedTypes = new Set<string>()

    for (const b of bindings) {
      // Extract fields
      const itemUri = b["item"]?.value ?? ""
      const wikidataId = extractQid(itemUri)
      const name = b["itemLabel"]?.value ?? ""
      const nameChinese = b["itemLabelZh"]?.value ?? ""
      const description = b["itemDescription"]?.value ?? ""
      const descriptionChinese = b["itemDescriptionZh"]?.value ?? ""
      const coordRaw = b["coord"]?.value ?? ""
      const inceptionRaw = b["inception"]?.value ?? ""
      const imageUrl = b["image"]?.value?.replace(/^http:\/\//, "https://")
      const instanceLabel = b["instanceLabel"]?.value ?? ""
      const articleUrl = b["article"]?.value

      // Skip if no Q-ID or name
      if (!wikidataId || !name || wikidataId === name) continue
      // Skip duplicates within this batch
      if (seen.has(wikidataId)) continue
      seen.add(wikidataId)

      // Parse coordinates
      const coords = parseCoordinates(coordRaw)
      if (!coords) continue

      // Map type
      const type = mapType(instanceLabel)
      if (!type) {
        unmappedTypes.add(instanceLabel)
        continue
      }

      // Parse inception year
      let yearBuilt = 0
      if (inceptionRaw) {
        const yearMatch = inceptionRaw.match(/^(-?\d+)/)
        if (yearMatch) {
          yearBuilt = parseInt(yearMatch[1], 10)
        }
      }
      // Skip if year is 0 (unknown) or after 1911
      if (yearBuilt === 0) continue
      if (yearBuilt > 1911) continue

      // Assign dynasty
      const dynasty = assignDynasty(yearBuilt, dynasties)

      // Deduplicate against curated entries
      if (isDuplicate(coords, curated)) {
        console.log(
          `[fetch-wikidata] Skipping duplicate: ${name} (${wikidataId})`,
        )
        continue
      }

      // Build structure entry
      const structure: Structure = {
        id: `wikidata-${wikidataId}`,
        name,
        nameChinese: nameChinese || name,
        type,
        dynasty,
        yearBuilt,
        yearCompleted: null,
        coordinates: coords,
        province: "",
        city: "",
        status: "complete",
        significance: "regional",
        source: "wikidata",
        wikidataId,
        wikimediaImage: imageUrl,
        wikipediaUrl: articleUrl,
        description: description || undefined,
        descriptionChinese: descriptionChinese || undefined,
        tags: [],
      }

      wikidataStructures.push(structure)
    }

    if (unmappedTypes.size > 0) {
      console.log(
        `[fetch-wikidata] Unmapped instance types (skipped): ${[...unmappedTypes].join(", ")}`,
      )
    }

    console.log(
      `[fetch-wikidata] Mapped ${wikidataStructures.length} Wikidata structures`,
    )
  } catch (err) {
    console.error("[fetch-wikidata] ERROR fetching from Wikidata:", err)
    console.warn("[fetch-wikidata] Falling back to curated-only output.")
    writeOutput(curated)
    return
  }

  // 8. Fill missing Chinese descriptions via Qwen translation
  const needsTranslation = wikidataStructures.filter(
    (s) => !s.descriptionChinese && s.description,
  )
  if (needsTranslation.length > 0) {
    if (!DASHSCOPE_KEY) {
      console.warn(
        `[fetch-wikidata] VITE_DASHSCOPE_KEY not set — skipping translation of ${needsTranslation.length} entries`,
      )
    } else {
      console.log(
        `[fetch-wikidata] Translating ${needsTranslation.length} missing Chinese descriptions via Qwen...`,
      )
      const results = await translateBatch(
        needsTranslation.map((s) => s.description!),
      )
      needsTranslation.forEach((structure, i) => {
        if (results[i]) structure.descriptionChinese = results[i]!
      })
      console.log("[fetch-wikidata] Translation complete")
    }
  }

  // 9. Translate missing Chinese fields on curated entries
  if (DASHSCOPE_KEY) {
    // Collect every string that needs translation, tagged by where it goes back
    type Slot =
      | { kind: 'architect'; entry: Structure }
      | { kind: 'style'; entry: Structure }
      | { kind: 'feature'; entry: Structure; index: number }
      | { kind: 'material'; entry: Structure; index: number }

    const slots: Slot[] = []
    const texts: string[] = []

    for (const entry of curated) {
      if (entry.architect && !entry.architectChinese) {
        slots.push({ kind: 'architect', entry })
        texts.push(entry.architect)
      }
      if (entry.architecturalStyle && !entry.architecturalStyleChinese) {
        slots.push({ kind: 'style', entry })
        texts.push(entry.architecturalStyle)
      }
      if (entry.keyFeatures && !entry.keyFeaturesChinese) {
        entry.keyFeatures.forEach((f, index) => {
          slots.push({ kind: 'feature', entry, index })
          texts.push(f)
        })
      }
      if (entry.materials && !entry.materialsChinese) {
        entry.materials.forEach((m, index) => {
          slots.push({ kind: 'material', entry, index })
          texts.push(m)
        })
      }
    }

    if (texts.length > 0) {
      console.log(`[fetch-wikidata] Translating ${texts.length} curated field strings via Qwen...`)
      const results = await translateBatch(texts)
      slots.forEach((slot, i) => {
        const translated = results[i]
        if (!translated) return
        if (slot.kind === 'architect') {
          slot.entry.architectChinese = translated
        } else if (slot.kind === 'style') {
          slot.entry.architecturalStyleChinese = translated
        } else if (slot.kind === 'feature') {
          if (!slot.entry.keyFeaturesChinese) {
            slot.entry.keyFeaturesChinese = [...(slot.entry.keyFeatures ?? [])]
          }
          slot.entry.keyFeaturesChinese[slot.index] = translated
        } else if (slot.kind === 'material') {
          if (!slot.entry.materialsChinese) {
            slot.entry.materialsChinese = [...(slot.entry.materials ?? [])]
          }
          slot.entry.materialsChinese[slot.index] = translated
        }
      })
      console.log('[fetch-wikidata] Curated field translation complete')
    }
  }

  // 10. Merge curated + wikidata
  const merged: unknown[] = [...curated, ...wikidataStructures] as unknown[]
  writeOutput(merged as Structure[])
}

function writeOutput(data: Structure[]) {
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), "utf-8")
  console.log(
    `[fetch-wikidata] Wrote ${data.length} structures to ${OUTPUT_PATH}`,
  )
}

main().catch((err) => {
  console.error("[fetch-wikidata] Fatal error:", err)
  process.exit(1)
})
