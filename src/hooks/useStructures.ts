import { useMemo, useState, useCallback } from 'react'
import structuresData from '../data/structures.json'
import { Structure, FilterState, StructureType, StructureSource } from '../types'

const baseStructures = structuresData as Structure[]

export function useStructures() {
  const [filters, setFilters] = useState<FilterState>({
    types: ['palace', 'residence', 'government', 'bridge'],
    dynasties: [],
    provinces: [],
    sources: ['curated', 'wikidata'],
  })
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sessionStructures, setSessionStructures] = useState<Structure[]>([])

  const addSessionStructure = useCallback((structure: Structure) => {
    setSessionStructures(prev =>
      prev.some(s => s.id === structure.id) ? prev : [...prev, structure]
    )
  }, [])

  // Full pool including session entries (used for matching + selection lookup)
  const allStructures = useMemo(
    () => [...baseStructures, ...sessionStructures],
    [sessionStructures]
  )

  // Filtered base structures + all session structures (always shown, bypass filter)
  const structures = useMemo(() => {
    const filtered = baseStructures.filter(s => {
      if (!filters.types.includes(s.type as StructureType)) return false
      if (filters.dynasties.length > 0 && !filters.dynasties.includes(s.dynasty)) return false
      if (filters.provinces.length > 0 && !filters.provinces.includes(s.province)) return false
      if (!filters.sources.includes(s.source as StructureSource)) return false
      return true
    })
    return [...filtered, ...sessionStructures]
  }, [filters, sessionStructures])

  const selected = useMemo(
    () => allStructures.find(s => s.id === selectedId) ?? null,
    [selectedId, allStructures]
  )

  const dynasties = useMemo(
    () => [...new Set(baseStructures.map(s => s.dynasty))].sort(),
    []
  )

  const provinces = useMemo(
    () => [...new Set(baseStructures.map(s => s.province).filter(Boolean))].sort(),
    []
  )

  return { structures, allStructures, filters, setFilters, selectedId, setSelectedId, selected, dynasties, provinces, addSessionStructure }
}
