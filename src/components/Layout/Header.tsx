import { NavLink } from "react-router-dom"
import { useLanguage } from "../../hooks/useLanguage"
import type { TranslationKey } from "../../i18n/translations"

const navItems: { to: string; zhKey: TranslationKey; enKey: TranslationKey }[] =
  [
    { to: "/map", zhKey: "nav.map", enKey: "nav.map" },
    { to: "/timeline", zhKey: "nav.timeline", enKey: "nav.timeline" },
    { to: "/about", zhKey: "nav.about", enKey: "nav.about" },
  ]

function LangToggle() {
  const { lang, toggle } = useLanguage()
  return (
    <button
      onClick={toggle}
      aria-label={lang === "zh" ? "Switch to English" : "切换为中文"}
      className="flex items-center rounded-lg overflow-hidden border border-stone-700 text-xs font-medium shrink-0"
    >
      <span
        className={`px-2.5 py-1.5 transition-colors ${lang === "zh" ? "bg-stone-700 text-stone-100" : "text-stone-500 hover:text-stone-300"}`}
      >
        中
      </span>
      <span className="px-0.5 text-stone-700 select-none">|</span>
      <span
        className={`px-2.5 py-1.5 transition-colors ${lang === "en" ? "bg-stone-700 text-stone-100" : "text-stone-500 hover:text-stone-300"}`}
      >
        EN
      </span>
    </button>
  )
}

export default function Header() {
  const { lang, t } = useLanguage()

  return (
    <header className="h-14 sm:h-16 bg-stone-900 border-b border-stone-800 flex items-center px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 sm:mr-8">
        <span className="text-lg sm:text-xl font-bold text-stone-100 font-chinese">
          筑览
        </span>
        <span className="text-stone-400 text-xs sm:text-sm font-medium tracking-widest uppercase">
          ZhuLan
        </span>
      </div>

      {/* Desktop nav — hidden on mobile */}
      <nav className="hidden sm:flex items-center gap-1">
        {navItems.map(({ to, zhKey, enKey }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-stone-700 text-stone-100"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800"
              }`
            }
          >
            <span className={lang === "zh" ? "font-chinese" : ""}>
              {t(lang === "zh" ? zhKey : enKey)}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden lg:block text-xs text-stone-600">
          {t("header.tagline")}
        </span>
        <LangToggle />
      </div>
    </header>
  )
}
