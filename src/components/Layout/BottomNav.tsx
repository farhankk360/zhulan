import { NavLink } from 'react-router-dom'
import { useLanguage } from '../../hooks/useLanguage'
import type { TranslationKey } from '../../i18n/translations'

const navItems: { to: string; labelKey: TranslationKey; icon: React.ReactNode }[] = [
  {
    to: '/map',
    labelKey: 'nav.map',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
        <line x1="9" y1="3" x2="9" y2="18" />
        <line x1="15" y1="6" x2="15" y2="21" />
      </svg>
    ),
  },
  {
    to: '/timeline',
    labelKey: 'nav.timeline',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <line x1="3" y1="12" x2="21" y2="12" />
        <circle cx="7" cy="12" r="2" fill="currentColor" stroke="none" />
        <circle cx="12" cy="8" r="2" fill="currentColor" stroke="none" />
        <circle cx="17" cy="12" r="2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: '/about',
    labelKey: 'nav.about',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const { t, lang } = useLanguage()

  return (
    <nav
      className="sm:hidden fixed bottom-0 inset-x-0 z-[900] bg-stone-900/95 backdrop-blur-md border-t border-stone-800 flex"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {navItems.map(({ to, labelKey, icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-xs transition-colors ${
              isActive ? 'text-red-400' : 'text-stone-500'
            } ${lang === 'zh' ? 'font-chinese' : ''}`
          }
        >
          {icon}
          <span>{t(labelKey)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
