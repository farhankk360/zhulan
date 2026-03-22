import { createContext } from 'react'
import { TranslationKey } from './translations'

export type Lang = 'zh' | 'en'

export interface LanguageContextValue {
  lang: Lang
  toggle: () => void
  t: (key: TranslationKey) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)
