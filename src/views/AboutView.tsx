import { useLanguage } from '../hooks/useLanguage'

const techStack = [
  ['Framework', 'React 18 + Vite + TypeScript'],
  ['Map', 'Leaflet.js + Tianditu (天地图)'],
  ['Charts', 'D3.js v7'],
  ['Styling', 'Tailwind CSS v3'],
  ['Data', 'Wikidata SPARQL + hand-curated JSON'],
  ['Deployment', 'GitHub Pages'],
] as const

export default function AboutView() {
  const { t } = useLanguage()

  return (
    <div className="h-full overflow-y-auto bg-stone-950 p-4 sm:p-6 pb-20 sm:pb-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-stone-100 mb-2">{t('about.heading')}</h1>
      <p className="text-stone-300 mb-8 leading-relaxed">{t('about.intro')}</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-stone-200 mb-3">{t('about.sectionBackground')}</h2>
        <p className="text-stone-400 leading-relaxed">{t('about.backgroundText')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-stone-200 mb-3">{t('about.sectionAI')}</h2>
        <ul className="space-y-2 text-stone-400">
          <li><span className="text-stone-200 font-medium">DeepSeek</span> — {t('about.aiDeepSeek')}</li>
          <li><span className="text-stone-200 font-medium">Tongyi (通义)</span> — {t('about.aiTongyi')}</li>
          <li><span className="text-stone-200 font-medium">Kimi</span> — {t('about.aiKimi')}</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-stone-200 mb-3">{t('about.sectionTech')}</h2>
        <div className="grid grid-cols-2 gap-2 text-sm text-stone-400">
          {techStack.map(([k, v]) => (
            <div key={k} className="bg-stone-900 rounded-lg px-3 py-2">
              <span className="text-stone-500 text-xs uppercase tracking-wide">{k}</span>
              <div className="text-stone-300 mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-200 mb-3">{t('about.sectionData')}</h2>
        <ul className="text-stone-400 text-sm space-y-1 list-disc list-inside">
          {(['about.dataItem1', 'about.dataItem2', 'about.dataItem3', 'about.dataItem4', 'about.dataItem5'] as const).map(key => (
            <li key={key}>{t(key)}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
