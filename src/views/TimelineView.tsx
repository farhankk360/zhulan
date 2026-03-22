import { useStructures } from '../hooks/useStructures'
import { useLanguage } from '../hooks/useLanguage'
import TimelineChart from '../components/Charts/TimelineChart'
import DynastyBarChart from '../components/Charts/DynastyBarChart'

export default function TimelineView() {
  const { allStructures } = useStructures()
  const { t } = useLanguage()

  return (
    <div className="h-full overflow-y-auto bg-stone-950 p-4 sm:p-6 pb-20 sm:pb-6">
      <h1 className="text-2xl font-bold text-stone-100 mb-2">{t('timeline.heading')}</h1>
      <p className="text-stone-400 text-sm mb-8">
        {allStructures.length} {t('timeline.subheading')}
      </p>
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-stone-200 mb-4">{t('timeline.sectionTimeline')}</h2>
        <div className="bg-stone-900 rounded-xl p-4">
          <TimelineChart structures={allStructures} />
        </div>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-stone-200 mb-4">{t('timeline.sectionDynasty')}</h2>
        <div className="bg-stone-900 rounded-xl p-4">
          <DynastyBarChart structures={allStructures} />
        </div>
      </section>
    </div>
  )
}
