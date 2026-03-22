/**
 * fetch-wikidata.ts
 *
 * Build-time script that enriches the structures dataset by querying Wikidata's
 * SPARQL endpoint for Chinese ancient architecture (pre-1911).
 *
 * Run: npx tsx scripts/fetch-wikidata.ts
 * Or:  npm run fetch-data
 *
 * What it does:
 * 1. Reads /src/data/curated.json (hand-maintained featured entries)
 * 2. Queries Wikidata SPARQL for palaces, bridges, residences, government buildings in China
 * 3. Maps Wikidata results to our Structure interface
 * 4. Deduplicates (curated entries win over Wikidata if coordinates are within ~1km)
 * 5. Assigns dynasty based on yearBuilt + dynasties.json date ranges
 * 6. Writes merged result to /src/data/structures.json
 *
 * Dependencies: only uses built-in fetch (Node 18+) — no extra packages needed.
 */

// ─── SPARQL QUERY ──────────────────────────────────────────────────────
// The query fetches structures in China that are instances (or subclasses) of
// the four building types allowed by the competition.
//
// Wikidata Q-codes for building types:
//   Palace:      Q16560  (palace)
//   Bridge:      Q12280  (bridge)
//   Residence:   Q11755880 (residential building) — also try Q3947 (house)
//   Government:  Q16831714 (government building) — also try Q27686 (public building)
//
// We also include broader classes and filter by country = China (Q148).
//
// NOTE: Wikidata coordinates are in "Point(longitude latitude)" format.
//       We need [latitude, longitude] for Leaflet.

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
`;

// ─── ENDPOINT ──────────────────────────────────────────────────────────
const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';

// ─── TYPE MAPPING ──────────────────────────────────────────────────────
// Map Wikidata instance labels to our four allowed types.
// This is a best-effort heuristic — the script logs unmapped types for review.
//
// instanceLabel (from Wikidata)  →  our type
// "palace"                       →  "palace"
// "bridge", "arch bridge", etc.  →  "bridge"
// "residential building", etc.   →  "residence"
// "government building", etc.    →  "government"
//
// Use keyword matching on the instanceLabel:
//   contains "palace" or "imperial" → palace
//   contains "bridge"               → bridge
//   contains "residen" or "house" or "dwelling" or "compound" or "courtyard" → residence
//   contains "government" or "yamen" or "office" or "administrative" → government
//   fallback: skip (log warning)

// ─── DYNASTY ASSIGNMENT ────────────────────────────────────────────────
// Given a yearBuilt and the dynasties.json ranges, find which dynasty the
// structure was built in. If the year falls in an overlap period (e.g. Yuan/Song),
// prefer the later dynasty. If no match, set dynasty to "Unknown".

// ─── COORDINATE PARSING ────────────────────────────────────────────────
// Wikidata returns coordinates as: "Point(116.3972 39.9163)"
// Parse to extract [lat, lng] = [39.9163, 116.3972] (note the swap!)

// ─── DEDUPLICATION ─────────────────────────────────────────────────────
// For each Wikidata entry, check if any curated entry has coordinates within
// ~0.01 degrees (~1km). If so, skip the Wikidata entry (curated wins).

// ─── OUTPUT FORMAT ─────────────────────────────────────────────────────
// Each Wikidata-sourced entry should look like:
// {
//   "id": "wikidata-Q215380",
//   "name": "Lugou Bridge",
//   "nameChinese": "卢沟桥",
//   "type": "bridge",
//   "dynasty": "Jin",
//   "yearBuilt": 1189,
//   "yearCompleted": null,
//   "coordinates": [39.8436, 116.2544],
//   "province": "",            // not easily available from Wikidata, leave empty
//   "city": "",
//   "status": "complete",      // default; not reliably available from Wikidata
//   "significance": "regional",// default for Wikidata entries
//   "source": "wikidata",
//   "wikidataId": "Q215380",
//   "wikimediaImage": "https://commons.wikimedia.org/...",
//   "wikipediaUrl": "https://en.wikipedia.org/wiki/...",
//   "description": "...",      // from Wikidata itemDescription if available
//   "descriptionChinese": "",
//   "tags": []
// }

// ─── ERROR HANDLING ────────────────────────────────────────────────────
// - If Wikidata is unreachable, log error and fall back to curated-only output
// - If SPARQL returns 0 results, log warning and fall back to curated-only
// - Never fail the build — always produce a valid structures.json

// ─── IMPLEMENTATION NOTES ──────────────────────────────────────────────
// - Use Node 18+ built-in fetch (no axios needed)
// - Set User-Agent header to identify the app (Wikidata policy)
// - Add 1-second delay between retries
// - Write output with JSON.stringify(data, null, 2) for readable diffs in git

export {};
