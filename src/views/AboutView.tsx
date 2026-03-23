import { useLanguage } from '../hooks/useLanguage'

export default function AboutView() {
  const { t } = useLanguage()

  const techStack = [
    [t('about.techFramework'), 'React 18 + Vite + TypeScript'],
    [t('about.techMap'), 'Leaflet.js + Tianditu (天地图)'],
    [t('about.techCharts'), 'D3.js v7'],
    [t('about.techStyling'), 'Tailwind CSS v3'],
    [t('about.techData'), 'Wikidata SPARQL + hand-curated JSON'],
    [t('about.techDeployment'), 'GitHub Pages'],
  ]

  return (
    <div className="h-full overflow-y-auto bg-stone-950 p-4 sm:p-6 pb-20 sm:pb-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-stone-100 mb-2">{t('about.heading')}</h1>
      <p className="text-stone-300 mb-8 leading-relaxed">{t('about.intro')}</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-stone-200 mb-3">{t('about.sectionBackground')}</h2>
        <p className="text-stone-400 leading-relaxed">{t('about.backgroundText')}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-stone-200 mb-2">{t('about.sectionAI')}</h2>
        <p className="text-stone-400 text-sm mb-5 leading-relaxed">{t('about.aiIntro')}</p>

        {/* Runtime AI */}
        <div className="mb-5">
          <h3 className="text-xs uppercase tracking-widest text-red-400 font-semibold mb-3">
            {t('about.aiRuntimeHeading')}
          </h3>
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">✦</span>
              <span className="text-stone-100 font-medium">{t('about.aiScanTitle')}</span>
              <span className="ml-auto text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">Qwen-VL-Max</span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">{t('about.aiScanDesc')}</p>
          </div>
        </div>

        {/* Build-time AI */}
        <div className="mb-5">
          <h3 className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-3">
            {t('about.aiBuildHeading')}
          </h3>
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">⚙</span>
              <span className="text-stone-100 font-medium">{t('about.aiTranslateTitle')}</span>
              <span className="ml-auto text-xs bg-amber-900 text-amber-300 px-2 py-0.5 rounded-full">Qwen-Turbo</span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed">{t('about.aiTranslateDesc')}</p>
          </div>
        </div>

        {/* Content creation AI */}
        <div>
          <h3 className="text-xs uppercase tracking-widest text-stone-500 font-semibold mb-3">
            {t('about.aiContentHeading')}
          </h3>
          <ul className="space-y-2 text-stone-400 text-sm">
            <li className="flex gap-2">
              <span className="text-stone-200 font-medium shrink-0">DeepSeek</span>
              <span>— {t('about.aiDeepSeek')}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-stone-200 font-medium shrink-0">Tongyi (通义)</span>
              <span>— {t('about.aiTongyi')}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-stone-200 font-medium shrink-0">Kimi</span>
              <span>— {t('about.aiKimi')}</span>
            </li>
          </ul>
        </div>
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
