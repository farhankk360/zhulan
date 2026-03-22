import { useMemo, useState } from 'react'
import structuresData from '../data/structures.json'
import { Structure, FilterState, StructureType, StructureSource } from '../types'

const allStructures = structuresData as Structure[]

export function useStructures() {
  const [filters, setFilters] = useState<FilterState>({
    types: ['palace', 'residence', 'government', 'bridge'],
    dynasties: [],
    provinces: [],
    sources: ['curated', 'wikidata'],
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return allStructures.filter(s => {
      if (!filters.types.includes(s.type as StructureType)) return false
      if (filters.dynasties.length > 0 && !filters.dynasties.includes(s.dynasty)) return false
      if (filters.provinces.length > 0 && !filters.provinces.includes(s.province)) return false
      if (!filters.sources.includes(s.source as StructureSource)) return false
      return true
    })
  }, [filters])

  const selected = useMemo(
    () => allStructures.find(s => s.id === selectedId) ?? null,
    [selectedId]
  )

  const dynasties = useMemo(
    () => [...new Set(allStructures.map(s => s.dynasty))].sort(),
    []
  )

  const provinces = useMemo(
    () => [...new Set(allStructures.map(s => s.province).filter(Boolean))].sort(),
    []
  )

  return { structures: filtered, allStructures, filters, setFilters, selectedId, setSelectedId, selected, dynasties, provinces }
}
