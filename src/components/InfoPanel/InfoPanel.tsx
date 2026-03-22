import { Structure, StructureType } from '../../types'
import { useLanguage } from '../../hooks/useLanguage'
import type { TranslationKey } from '../../i18n/translations'
import { formatYear } from '../../utils/formatYear'

const TYPE_LABEL_KEYS: Record<StructureType, { labelKey: TranslationKey; color: string }> = {
  palace: { labelKey: 'info.typePalace', color: 'bg-red-900 text-red-200' },
  residence: { labelKey: 'info.typeResidence', color: 'bg-amber-900 text-amber-200' },
  government: { labelKey: 'info.typeGovernment', color: 'bg-blue-900 text-blue-200' },
  bridge: { labelKey: 'info.typeBridge', color: 'bg-teal-900 text-teal-200' },
}

interface Props {
  structure: Structure
  onClose: () => void
}

function TypeBadge({ type }: { type: StructureType }) {
  const { t } = useLanguage()
  const { labelKey, color } = TYPE_LABEL_KEYS[type]
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>
      {t(labelKey)}
    </span>
  )
}

function CuratedPanel({ structure }: { structure: Structure }) {
  const { t, lang } = useLanguage()
  const primary = lang === 'zh' ? structure.descriptionChinese : structure.description
  const secondary = lang === 'zh' ? structure.description : structure.descriptionChinese

  return (
    <>
      {structure.image && (
        <img
          src={`${(import.meta as ImportMeta & { env: Record<string, string> }).env.BASE_URL}${structure.image.replace(/^\//, '')}`}
          alt={structure.name}
          className="w-full h-40 object-cover rounded-lg mb-4"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}
      {primary && (
        <p className="text-stone-300 text-sm leading-relaxed mb-2">{primary}</p>
      )}
      {secondary && (
        <p className="text-stone-400 text-sm leading-relaxed font-chinese mb-4">{secondary}</p>
      )}
      {structure.architect && (
        <div className="mb-2">
          <span className="text-stone-500 text-xs uppercase tracking-wide">{t('info.fieldArchitect')}</span>
          <p className="text-stone-300 text-sm">{structure.architect}</p>
        </div>
      )}
      {structure.architecturalStyle && (
        <div className="mb-2">
          <span className="text-stone-500 text-xs uppercase tracking-wide">{t('info.fieldStyle')}</span>
          <p className="text-stone-300 text-sm">{structure.architecturalStyle}</p>
        </div>
      )}
      {structure.keyFeatures && structure.keyFeatures.length > 0 && (
        <div className="mb-2">
          <span className="text-stone-500 text-xs uppercase tracking-wide">{t('info.fieldFeatures')}</span>
          <ul className="mt-1 space-y-1">
            {structure.keyFeatures.map((f, i) => (
              <li key={i} className="text-stone-300 text-sm flex gap-2">
                <span className="text-stone-600">·</span>{f}
              </li>
            ))}
          </ul>
        </div>
      )}
      {structure.materials && structure.materials.length > 0 && (
        <div className="mb-2">
          <span className="text-stone-500 text-xs uppercase tracking-wide">{t('info.fieldMaterials')}</span>
          <p className="text-stone-300 text-sm">{structure.materials.join(', ')}</p>
        </div>
      )}
      {structure.sources && structure.sources.length > 0 && (
        <div className="mb-2">
          <span className="text-stone-500 text-xs uppercase tracking-wide">{t('info.fieldSources')}</span>
          <ul className="mt-1 space-y-1">
            {structure.sources.map((s, i) => (
              <li key={i} className="text-stone-400 text-xs">{s}</li>
            ))}
          </ul>
        </div>
      )}
      {structure.imageCredit && (
        <p className="text-stone-600 text-xs mt-4">{t('info.imageCredit')}: {structure.imageCredit}</p>
      )}
    </>
  )
}

function WikidataPanel({ structure }: { structure: Structure }) {
  const { t } = useLanguage()
  return (
    <>
      {structure.wikimediaImage && (
        <img
          src={structure.wikimediaImage}
          alt={structure.name}
          className="w-full h-40 object-cover rounded-lg mb-4"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}
      {structure.description && (
        <p className="text-stone-300 text-sm leading-relaxed mb-4">{structure.description}</p>
      )}
      {structure.wikipediaUrl && (
        <a
          href={structure.wikipediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
        >
          {t('info.wikipedia')}
        </a>
      )}
    </>
  )
}

export default function InfoPanel({ structure, onClose }: Props) {
  const { lang, t } = useLanguage()

  const primaryName = lang === 'zh' ? structure.nameChinese : structure.name
  const secondaryName = lang === 'zh' ? structure.name : structure.nameChinese
  const yearLabel = formatYear(structure.yearBuilt, lang)

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="sm:hidden fixed inset-0 z-[1099] bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bottom sheet on mobile, sidebar on desktop */}
      <div className="
        fixed bottom-0 inset-x-0 z-[1100]
        max-h-[65vh] rounded-t-2xl
        sm:relative sm:inset-x-auto sm:bottom-auto sm:z-auto
        sm:w-80 sm:h-full sm:max-h-none sm:rounded-none
        bg-stone-900 border-t border-stone-800
        sm:border-t-0 sm:border-l
        flex flex-col overflow-hidden
      ">
        {/* Drag handle (mobile only) */}
        <div className="sm:hidden flex justify-center pt-2.5 pb-1 shrink-0">
          <div className="w-10 h-1 bg-stone-600 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-4 py-3 border-b border-stone-800 shrink-0">
          <div className="flex-1 min-w-0">
            <h2 className={`text-stone-100 font-semibold text-base leading-tight truncate ${lang === 'zh' ? 'font-chinese' : ''}`}>
              {primaryName}
            </h2>
            <p className={`text-stone-400 text-sm mt-0.5 ${lang === 'en' ? 'font-chinese' : ''}`}>
              {secondaryName}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <TypeBadge type={structure.type} />
              <span className="text-stone-500 text-xs">{structure.dynasty} · {yearLabel}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors shrink-0"
            aria-label={t('info.closePanel')}
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4">
          {structure.source === 'curated' || structure.source === 'ai-identified'
            ? <CuratedPanel structure={structure} />
            : <WikidataPanel structure={structure} />
          }
        </div>
      </div>
    </>
  )
}
