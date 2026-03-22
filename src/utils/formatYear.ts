import { Lang } from '../i18n/languageContext'

export function formatYear(year: number, lang: Lang): string {
  if (year < 0) {
    return lang === 'zh' ? `公元前 ${Math.abs(year)} 年` : `${Math.abs(year)} BCE`
  }
  return lang === 'zh' ? `${year} 年` : `${year} CE`
}
