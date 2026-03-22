import { useState, useCallback, ReactNode } from 'react'
import { translations } from '../i18n/translations'
import { LanguageContext, Lang } from '../i18n/languageContext'
import type { TranslationKey } from '../i18n/translations'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem('zhulan-lang')
    return stored === 'en' ? 'en' : 'zh'
  })

  const toggle = useCallback(() => {
    setLang(prev => {
      const next: Lang = prev === 'zh' ? 'en' : 'zh'
      localStorage.setItem('zhulan-lang', next)
      return next
    })
  }, [])

  const t = useCallback(
    (key: TranslationKey): string => translations[lang][key],
    [lang],
  )

  return (
    <LanguageContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LanguageContext.Provider>
  )
}
