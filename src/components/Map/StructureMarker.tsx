import { CircleMarker, Popup, Tooltip } from 'react-leaflet'
import { Structure, StructureType } from '../../types'
import { useLanguage } from '../../hooks/useLanguage'

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
  const { lang } = useLanguage()
  const isAI = structure.source === 'ai-identified'
  const color = isAI ? '#9333EA' : TYPE_COLORS[structure.type]
  const radius = isAI ? 9 : structure.source === 'curated' ? 8 : 5
  const displayName = lang === 'zh' ? structure.nameChinese : structure.name

  return (
    <CircleMarker
      center={structure.coordinates}
      radius={isSelected ? radius + 3 : radius}
      pathOptions={{
        color: isAI ? '#C084FC' : color,
        fillColor: color,
        fillOpacity: isSelected ? 1 : 0.8,
        weight: isAI ? 2.5 : isSelected ? 2 : 1,
      }}
      eventHandlers={{
        click: () => onClick(structure.id),
      }}
    >
      {isAI && (
        <Tooltip permanent direction="top" offset={[0, -12]} className="ai-marker-label">
          {displayName}
        </Tooltip>
      )}
      <Popup>
        <div className="text-sm font-semibold">{displayName}</div>
      </Popup>
    </CircleMarker>
  )
}
