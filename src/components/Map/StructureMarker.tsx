import { CircleMarker, Popup } from 'react-leaflet'
import { Structure, StructureType } from '../../types'

const TYPE_COLORS: Record<StructureType, string> = {
  palace: '#DC2626',
  residence: '#D97706',
  government: '#2563EB',
  bridge: '#0D9488',
}

interface Props {
  structure: Structure
  isSelected: boolean
  onClick: (id: string) => void
}

export default function StructureMarker({ structure, isSelected, onClick }: Props) {
  const color = TYPE_COLORS[structure.type]
  const radius = structure.source === 'curated' ? 8 : 5

  return (
    <CircleMarker
      center={structure.coordinates}
      radius={isSelected ? radius + 3 : radius}
      pathOptions={{
        color: color,
        fillColor: color,
        fillOpacity: isSelected ? 1 : 0.7,
        weight: isSelected ? 2 : 1,
      }}
      eventHandlers={{
        click: () => onClick(structure.id),
      }}
    >
      <Popup>
        <div className="text-sm">
          <div className="font-semibold">{structure.name}</div>
          <div className="text-stone-500">{structure.nameChinese}</div>
        </div>
      </Popup>
    </CircleMarker>
  )
}
