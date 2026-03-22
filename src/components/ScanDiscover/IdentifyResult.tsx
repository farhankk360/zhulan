import { useLanguage } from '../../hooks/useLanguage'
import { IdentifyResponse, IdentifySuccess, StructureType } from '../../types'
import type { TranslationKey } from '../../i18n/translations'

interface Props {
  result: IdentifyResponse
  userPhoto: string
  onViewOnMap: () => void
  onClose: () => void
  onRetry: () => void
}

const CONFIDENCE_STYLE: Record<IdentifySuccess['confidence'], string> = {
  high: 'bg-green-900 text-green-300',
  medium: 'bg-amber-900 text-amber-300',
  low: 'bg-red-900 text-red-300',
}

const CONFIDENCE_KEY: Record<IdentifySuccess['confidence'], TranslationKey> = {
  high: 'result.confidenceHigh',
  medium: 'result.confidenceMedium',
  low: 'result.confidenceLow',
}

const TYPE_KEY: Record<StructureType, TranslationKey> = {
  palace: 'result.typePalace',
  residence: 'result.typeResidence',
  government: 'result.typeGovernment',
  bridge: 'result.typeBridge',
}

export default function IdentifyResult({ result, userPhoto, onViewOnMap, onClose, onRetry }: Props) {
  const { t } = useLanguage()

  return (
    <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-stone-900 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-700 sticky top-0 bg-stone-900">
          <h2 className="font-semibold text-stone-100">
            {result.identified ? t('result.titleFound') : t('result.titleNotFound')}
          </h2>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-100 text-2xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-4">
          <img src={userPhoto} alt="Your photo" className="w-full h-40 object-cover rounded-xl bg-stone-800" />

          {result.identified ? (
            <>
              {/* Name + confidence */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-stone-100">{result.name}</h3>
                  <p className="text-stone-400 font-chinese text-lg">{result.nameChinese}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${CONFIDENCE_STYLE[result.confidence]}`}>
                  {t(CONFIDENCE_KEY[result.confidence])}
                </span>
              </div>

              {/* Metadata pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-stone-800 text-stone-300 px-2.5 py-1 rounded-full">
                  {t(TYPE_KEY[result.type])}
                </span>
                <span className="bg-stone-800 text-stone-300 px-2.5 py-1 rounded-full">
                  🏛 {result.dynasty}{t('result.dynastySuffix')}
                </span>
                <span className="bg-stone-800 text-stone-300 px-2.5 py-1 rounded-full">
                  📅 ~{result.estimatedYear}
                </span>
                {result.province && (
                  <span className="bg-stone-800 text-stone-300 px-2.5 py-1 rounded-full">
                    📍 {result.province}
                  </span>
                )}
              </div>

              {/* Significance */}
              {result.significance && (
                <p className="text-stone-300 text-sm leading-relaxed">{result.significance}</p>
              )}

              {/* Historical facts */}
              {result.historicalFacts.length > 0 && (
                <div>
                  <h4 className="text-xs uppercase tracking-wide text-stone-500 mb-2">{t('result.historicalFacts')}</h4>
                  <ul className="space-y-1.5">
                    {result.historicalFacts.map((fact, i) => (
                      <li key={i} className="flex gap-2 text-sm text-stone-300">
                        <span className="text-red-500 shrink-0">▪</span>
                        {fact}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={onViewOnMap}
                className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold text-sm transition-colors"
              >
                {t('result.viewOnMap')}
              </button>
            </>
          ) : (
            <>
              <div className="text-center py-4 space-y-2">
                <p className="text-4xl">🤔</p>
                <p className="text-stone-200 font-medium">{t('result.notFoundMsg')}</p>
                <p className="text-stone-400 text-sm">{result.reason}</p>
                {result.suggestion && (
                  <p className="text-stone-500 text-xs mt-2 bg-stone-800 rounded-lg px-3 py-2">{result.suggestion}</p>
                )}
              </div>
              <button
                onClick={onRetry}
                className="w-full py-3 bg-stone-700 hover:bg-stone-600 text-stone-100 rounded-xl font-medium text-sm transition-colors"
              >
                {t('result.retryButton')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
