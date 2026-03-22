import { useLanguage } from "../../hooks/useLanguage"
import { FilterState, StructureType, StructureSource } from "../../types"
import type { TranslationKey } from "../../i18n/translations"

const TYPE_ITEMS: {
  value: StructureType
  labelKey: TranslationKey
  color: string
}[] = [
  {
    value: "palace",
    labelKey: "filter.typePalace",
    color: "bg-red-700 hover:bg-red-600",
  },
  {
    value: "residence",
    labelKey: "filter.typeResidence",
    color: "bg-amber-700 hover:bg-amber-600",
  },
  {
    value: "government",
    labelKey: "filter.typeGovernment",
    color: "bg-blue-700 hover:bg-blue-600",
  },
  {
    value: "bridge",
    labelKey: "filter.typeBridge",
    color: "bg-teal-700 hover:bg-teal-600",
  },
]

const SOURCE_ITEMS: { value: StructureSource; labelKey: TranslationKey }[] = [
  { value: "curated", labelKey: "filter.sourceCurated" },
  { value: "wikidata", labelKey: "filter.sourceWikidata" },
]

interface Props {
  filters: FilterState
  onChange: (filters: FilterState) => void
}

export default function FilterPanel({ filters, onChange }: Props) {
  const { t } = useLanguage()

  function toggleType(type: StructureType) {
    const types = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type]
    onChange({ ...filters, types })
  }

  function toggleSource(source: StructureSource) {
    const sources = filters.sources.includes(source)
      ? filters.sources.filter((s) => s !== source)
      : [...filters.sources, source]
    onChange({ ...filters, sources })
  }

  return (
    <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 shadow-xl w-[calc(100vw-2rem)] sm:w-56">
      <h3 className="text-stone-200 font-semibold text-sm mb-3">
        {t("filter.heading")}
      </h3>

      <div className="mb-4">
        <p className="text-stone-500 text-xs uppercase tracking-wide mb-2">
          {t("filter.typeLabel")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {TYPE_ITEMS.map(({ value, labelKey, color }) => {
            const active = filters.types.includes(value)
            return (
              <button
                key={value}
                onClick={() => toggleType(value)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  active
                    ? `${color} text-white`
                    : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                }`}
              >
                {t(labelKey)}
              </button>
            )
          })}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-stone-500 text-xs uppercase tracking-wide mb-2">
          {t("filter.sourceLabel")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {SOURCE_ITEMS.map(({ value, labelKey }) => {
            const active = filters.sources.includes(value)
            return (
              <button
                key={value}
                onClick={() => toggleSource(value)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  active
                    ? "bg-stone-600 text-stone-100"
                    : "bg-stone-800 text-stone-400 hover:bg-stone-700"
                }`}
              >
                {t(labelKey)}
              </button>
            )
          })}
        </div>
      </div>

      <button
        onClick={() =>
          onChange({
            types: ["palace", "residence", "government", "bridge"],
            dynasties: [],
            provinces: [],
            sources: ["curated", "wikidata"],
          })
        }
        className="w-full text-xs text-stone-500 hover:text-stone-300 transition-colors py-1"
      >
        {t("filter.resetAll")}
      </button>
    </div>
  )
}
