import { useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useLang } from './lib/i18n'
import { useStore } from './lib/store'

export default function App() {
  const { t, lang, setLang, num } = useLang()
  const { saved } = useStore()
  const { pathname } = useLocation()
  const onHome = pathname === '/'

  // new page, new reading position (the explorer manages its own scroll)
  useEffect(() => { if (!pathname.startsWith('/explore')) window.scrollTo(0, 0) }, [pathname])

  return (
    <>
      <a className="skip" href="#main">{t('skip')}</a>
      <header className={'nav' + (onHome ? ' nav--home' : '')}>
        <Link to="/" className="nav__mark" aria-label="Ahwa home" viewTransition>
          <span lang="en">AHWA</span><span className="nav__mark-ar" lang="ar">قهوة</span>
        </Link>
        <nav className="nav__links" aria-label="Main">
          <NavLink to="/explore" viewTransition>{t('navExplore')}</NavLink>
          <NavLink to="/saved" viewTransition>
            {t('navSaved')}{saved.length > 0 && <span className="nav__count">{num(saved.length)}</span>}
          </NavLink>
          <button
            type="button"
            className="nav__lang"
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            aria-label={t('switchLangLabel')}
            lang={lang === 'en' ? 'ar' : 'en'}
          >
            {t('switchLang')}
          </button>
        </nav>
        {onHome && <Link to="/explore" className="btn btn--accent nav__cta" viewTransition>{t('openMap')}</Link>}
      </header>
      <main id="main"><Outlet /></main>
    </>
  )
}
