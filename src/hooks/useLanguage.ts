import { useContext } from 'react'
import { LanguageContext, LanguageContextValue, Lang } from '../i18n/languageContext'

export type { Lang }

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>')
  return ctx
}
