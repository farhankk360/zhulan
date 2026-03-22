import { useEffect } from "react"
import { MapContainer as LeafletMapContainer, useMap } from "react-leaflet"
import TiandituLayer from "./TiandituLayer"
import StructureMarker from "./StructureMarker"
import { Structure } from "../../types"
import "leaflet/dist/leaflet.css"

const DEFAULT_CENTER: [number, number] = [35.8617, 104.1954]
const DEFAULT_ZOOM = 5

interface Props {
  structures: Structure[]
  selectedId: string | null
  onSelect: (id: string) => void
  flyToTarget?: [number, number]
  extraStructures?: Structure[]
}

function FlyToController({ target }: { target?: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (target) map.flyTo(target, 12, { duration: 1.5 })
  }, [target, map])
  return null
}

export default function MapContainer({
  structures,
  selectedId,
  onSelect,
  flyToTarget,
  extraStructures = [],
}: Props) {
  return (
    <LeafletMapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={3}
      maxZoom={18}
      style={{ height: "100%", width: "100%" }}
      className="bg-stone-800"
      attributionControl={false}
    >
      <TiandituLayer />
      <FlyToController target={flyToTarget} />
      {structures.map((structure) => (
        <StructureMarker
          key={structure.id}
          structure={structure}
          isSelected={structure.id === selectedId}
          onClick={onSelect}
        />
      ))}
      {extraStructures.map((structure) => (
        <StructureMarker
          key={structure.id}
          structure={structure}
          isSelected={structure.id === selectedId}
          onClick={onSelect}
        />
      ))}
    </LeafletMapContainer>
  )
}
