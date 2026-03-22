import { useLanguage } from '../../hooks/useLanguage'

export default function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="hidden sm:flex h-10 bg-stone-900 border-t border-stone-800 items-center justify-center shrink-0">
      <p className="text-stone-500 text-xs">{t('footer.credit')}</p>
    </footer>
  )
}
