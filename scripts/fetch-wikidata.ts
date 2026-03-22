/**
 * fetch-wikidata.ts
 *
 * Build-time script that enriches the structures dataset by querying Wikidata's
 * SPARQL endpoint for Chinese ancient architecture (pre-1911).
 *
 * Run: npx tsx scripts/fetch-wikidata.ts
 * Or:  npm run fetch-data
 */

import * as fs from 'node:fs'
import * as path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ─── PATHS ──────────────────────────────────────────────────────────────────
const CURATED_PATH = path.resolve(__dirname, '../src/data/curated.json')
const DYNASTIES_PATH = path.resolve(__dirname, '../src/data/dynasties.json')
const OUTPUT_PATH = path.resolve(__dirname, '../src/data/structures.json')

// ─── TYPES ──────────────────────────────────────────────────────────────────
type StructureType = 'palace' | 'residence' | 'government' | 'bridge'

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
  status: 'complete' | 'ruin' | 'reconstructed'
  significance: 'national' | 'regional' | 'local'
  source: 'curated' | 'wikidata'
  tags: string[]
  description?: string
  descriptionChinese?: string
  architect?: string
  keyFeatures?: string[]
  architecturalStyle?: string
  materials?: string[]
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

const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql'

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Parse "Point(lng lat)" → [lat, lng] */
function parseCoordinates(point: string): [number, number] | null {
  const match = point.match(/Point\(([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)\)/)
  if (!match) return null
  const lng = parseFloat(match[1])
  const lat = parseFloat(match[2])
  if (isNaN(lat) || isNaN(lng)) return null
  return [lat, lng]
}

/** Map instanceLabel to StructureType via keyword matching */
function mapType(instanceLabel: string): StructureType | null {
  const label = instanceLabel.toLowerCase()
  if (label.includes('palace') || label.includes('imperial')) return 'palace'
  if (label.includes('bridge') || label.includes('arch')) return 'bridge'
  if (
    label.includes('residen') ||
    label.includes('house') ||
    label.includes('dwelling') ||
    label.includes('compound') ||
    label.includes('courtyard') ||
    label.includes('hutong')
  ) return 'residence'
  if (
    label.includes('government') ||
    label.includes('yamen') ||
    label.includes('office') ||
    label.includes('administrative') ||
    label.includes('public')
  ) return 'government'
  return null
}

/** Assign dynasty from yearBuilt using dynasties.json ranges */
function assignDynasty(yearBuilt: number, dynasties: Dynasty[]): string {
  const matches = dynasties.filter(d => yearBuilt >= d.start && yearBuilt <= d.end)
  if (matches.length === 0) return 'Unknown'
  return matches.sort((a, b) => b.start - a.start)[0].name
}

/** Check if a Wikidata entry is within ~0.01 degrees of any curated entry */
function isDuplicate(coords: [number, number], curated: Structure[]): boolean {
  return curated.some(c => {
    return Math.abs(c.coordinates[0] - coords[0]) < 0.01 &&
           Math.abs(c.coordinates[1] - coords[1]) < 0.01
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
  'xml:lang'?: string
}

interface SparqlResult {
  results: {
    bindings: Array<Record<string, SparqlBinding>>
  }
}

// ─── MAIN ────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Read curated.json
  const curated: Structure[] = JSON.parse(fs.readFileSync(CURATED_PATH, 'utf-8'))
  console.log(`[fetch-wikidata] Loaded ${curated.length} curated entries`)

  // 2. Read dynasties.json
  const dynasties: Dynasty[] = JSON.parse(fs.readFileSync(DYNASTIES_PATH, 'utf-8'))
  console.log(`[fetch-wikidata] Loaded ${dynasties.length} dynasties`)

  let wikidataStructures: Structure[] = []

  try {
    // 3. Query Wikidata SPARQL
    console.log('[fetch-wikidata] Querying Wikidata SPARQL...')
    const url = `${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(SPARQL_QUERY)}&format=json`
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/sparql-results+json',
        'User-Agent': 'ZhuLan/0.1 (4C Competition 2026; zh-CN ancient architecture visualization)',
      },
    })

    if (!response.ok) {
      throw new Error(`SPARQL request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as SparqlResult
    const bindings = data.results.bindings

    if (bindings.length === 0) {
      console.warn('[fetch-wikidata] WARNING: Wikidata returned 0 results. Using curated-only.')
      writeOutput(curated)
      return
    }

    console.log(`[fetch-wikidata] Received ${bindings.length} Wikidata bindings`)

    // 4 & 5. Parse and map results
    const seen = new Set<string>()
    const unmappedTypes = new Set<string>()

    for (const b of bindings) {
      // Extract fields
      const itemUri = b['item']?.value ?? ''
      const wikidataId = extractQid(itemUri)
      const name = b['itemLabel']?.value ?? ''
      const nameChinese = b['itemLabelZh']?.value ?? ''
      const description = b['itemDescription']?.value ?? ''
      const coordRaw = b['coord']?.value ?? ''
      const inceptionRaw = b['inception']?.value ?? ''
      const imageUrl = b['image']?.value?.replace(/^http:\/\//, 'https://')
      const instanceLabel = b['instanceLabel']?.value ?? ''
      const articleUrl = b['article']?.value

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
        console.log(`[fetch-wikidata] Skipping duplicate: ${name} (${wikidataId})`)
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
        province: '',
        city: '',
        status: 'complete',
        significance: 'regional',
        source: 'wikidata',
        wikidataId,
        wikimediaImage: imageUrl,
        wikipediaUrl: articleUrl,
        description: description || undefined,
        descriptionChinese: '',
        tags: [],
      }

      wikidataStructures.push(structure)
    }

    if (unmappedTypes.size > 0) {
      console.log(`[fetch-wikidata] Unmapped instance types (skipped): ${[...unmappedTypes].join(', ')}`)
    }

    console.log(`[fetch-wikidata] Mapped ${wikidataStructures.length} Wikidata structures`)
  } catch (err) {
    console.error('[fetch-wikidata] ERROR fetching from Wikidata:', err)
    console.warn('[fetch-wikidata] Falling back to curated-only output.')
    writeOutput(curated)
    return
  }

  // 8. Merge curated + wikidata
  const merged: unknown[] = [...curated, ...wikidataStructures] as unknown[]
  writeOutput(merged as Structure[])
}

function writeOutput(data: Structure[]) {
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`[fetch-wikidata] Wrote ${data.length} structures to ${OUTPUT_PATH}`)
}

main().catch(err => {
  console.error('[fetch-wikidata] Fatal error:', err)
  process.exit(1)
})
