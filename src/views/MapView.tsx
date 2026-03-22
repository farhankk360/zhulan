import { useState, useCallback } from "react"
import MapContainer from "../components/Map/MapContainer"
import InfoPanel from "../components/InfoPanel/InfoPanel"
import FilterPanel from "../components/Filters/FilterPanel"
import ScanButton from "../components/ScanDiscover/ScanButton"
import CameraCapture from "../components/ScanDiscover/CameraCapture"
import IdentifyResult from "../components/ScanDiscover/IdentifyResult"
import { useStructures } from "../hooks/useStructures"
import { useLanguage } from "../hooks/useLanguage"
import { identifyStructure } from "../services/qwenVL"
import { IdentifyResponse, IdentifySuccess, Structure } from "../types"

function buildTempStructure(result: IdentifySuccess): Structure {
  return {
    id: `ai-${Date.now()}`,
    name: result.name,
    nameChinese: result.nameChinese,
    type: result.type,
    dynasty: result.dynasty,
    yearBuilt: result.estimatedYear,
    yearCompleted: null,
    coordinates: result.coordinates,
    province: result.province,
    city: result.city,
    status: "complete",
    significance: "regional",
    source: "ai-identified",
    tags: [],
    description: result.significance,
    keyFeatures: result.historicalFacts,
    architecturalStyle: result.architecturalStyle,
  }
}

function matchInDataset(
  result: IdentifySuccess,
  allStructures: Structure[],
): Structure | null {
  const nameLower = result.name.toLowerCase()
  const nameZh = result.nameChinese

  const byName = allStructures.find(
    (s) => s.name.toLowerCase() === nameLower || s.nameChinese === nameZh,
  )
  if (byName) return byName

  const [lat, lng] = result.coordinates
  return (
    allStructures.find(
      (s) =>
        Math.abs(s.coordinates[0] - lat) < 0.05 &&
        Math.abs(s.coordinates[1] - lng) < 0.05,
    ) ?? null
  )
}

export default function MapView() {
  const {
    structures,
    allStructures,
    filters,
    setFilters,
    selectedId,
    setSelectedId,
    selected,
  } = useStructures()
  const { t } = useLanguage()
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Scan & Discover state
  const [scanOpen, setScanOpen] = useState(false)
  const [isIdentifying, setIsIdentifying] = useState(false)
  const [identifyResult, setIdentifyResult] = useState<IdentifyResponse | null>(
    null,
  )
  const [userPhoto, setUserPhoto] = useState<string | null>(null)
  const [aiStructure, setAiStructure] = useState<Structure | null>(null)
  const [flyToTarget, setFlyToTarget] = useState<[number, number] | undefined>()
  const [scanError, setScanError] = useState<string | null>(null)

  const handleIdentify = useCallback(
    async (file: File, preview: string) => {
      setIsIdentifying(true)
      setScanError(null)
      setUserPhoto(preview)
      try {
        const result = await identifyStructure(file)
        setIdentifyResult(result)
        setScanOpen(false)

        if (result.identified) {
          const match = matchInDataset(result, allStructures)
          if (match) {
            setSelectedId(match.id)
            setFlyToTarget([...match.coordinates])
            setAiStructure(null)
          } else {
            const temp = buildTempStructure(result)
            setAiStructure(temp)
            setSelectedId(temp.id)
            setFlyToTarget([...result.coordinates])
          }
        }
      } catch (err) {
        setScanError(
          err instanceof Error ? err.message : t("map.identifyFailed"),
        )
      } finally {
        setIsIdentifying(false)
      }
    },
    [allStructures, setSelectedId, t],
  )

  function handleViewOnMap() {
    setIdentifyResult(null)
  }

  function handleRetry() {
    setIdentifyResult(null)
    setScanOpen(true)
  }

  const selectedStructure =
    selected ?? (aiStructure?.id === selectedId ? aiStructure : null)

  return (
    <div className="relative flex h-full">
      <div className="flex-1 relative">
        <MapContainer
          structures={structures}
          selectedId={selectedId}
          onSelect={setSelectedId}
          flyToTarget={flyToTarget}
          extraStructures={aiStructure ? [aiStructure] : []}
        />

        <button
          onClick={() => setFiltersOpen((v) => !v)}
          className="absolute top-3 left-16 z-[1000] bg-stone-800 hover:bg-stone-700 text-stone-100 px-3 py-2 rounded-lg shadow-lg text-sm font-medium"
        >
          {t("map.filtersButton")}
        </button>

        {filtersOpen && (
          <div className="absolute top-16 left-4 z-[1000]">
            <FilterPanel filters={filters} onChange={setFilters} />
          </div>
        )}

        {scanError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-900 text-red-200 text-sm px-4 py-2 rounded-lg shadow-lg max-w-xs text-center">
            {scanError}
            <button
              onClick={() => setScanError(null)}
              className="ml-3 underline"
            >
              {t("map.errorDismiss")}
            </button>
          </div>
        )}

        <ScanButton onClick={() => setScanOpen(true)} />
      </div>

      {selectedStructure && (
        <InfoPanel
          structure={selectedStructure}
          onClose={() => {
            setSelectedId(null)
            setAiStructure(null)
          }}
        />
      )}

      {scanOpen && (
        <CameraCapture
          onIdentify={handleIdentify}
          onClose={() => setScanOpen(false)}
          isLoading={isIdentifying}
        />
      )}

      {identifyResult && userPhoto && (
        <IdentifyResult
          result={identifyResult}
          userPhoto={userPhoto}
          onViewOnMap={handleViewOnMap}
          onClose={() => setIdentifyResult(null)}
          onRetry={handleRetry}
        />
      )}
    </div>
  )
}
