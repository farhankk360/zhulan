export type StructureType = 'palace' | 'residence' | 'government' | 'bridge'
export type StructureStatus = 'complete' | 'ruin' | 'reconstructed'
export type StructureSignificance = 'national' | 'regional' | 'local'
export type StructureSource = 'curated' | 'wikidata' | 'ai-identified'

export interface Structure {
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
  status: StructureStatus
  significance: StructureSignificance
  source: StructureSource
  tags: string[]

  // Curated-only fields
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

  // Wikidata-only fields
  wikidataId?: string
  wikimediaImage?: string
  wikipediaUrl?: string
}

export interface Dynasty {
  name: string
  nameChinese: string
  start: number
  end: number
  color: string
}

export interface IdentifySuccess {
  identified: true
  confidence: 'high' | 'medium' | 'low'
  name: string
  nameChinese: string
  type: StructureType
  dynasty: string
  estimatedYear: number
  coordinates: [number, number]
  province: string
  city: string
  historicalFacts: string[]
  historicalFactsChinese: string[]
  architecturalStyle: string
  significance: string
}

export interface IdentifyFailure {
  identified: false
  reason: string
  suggestion: string
}

export type IdentifyResponse = IdentifySuccess | IdentifyFailure

export interface FilterState {
  types: StructureType[]
  dynasties: string[]
  provinces: string[]
  sources: StructureSource[]
}
