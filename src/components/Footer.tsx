import { Link } from 'react-router-dom'
import { useLang } from '../lib/i18n'

const BLOCKS = [
  { ch: 'A', h: 100, c: 'var(--red)' },
  { ch: 'H', h: 74, c: 'var(--mustard)' },
  { ch: 'W', h: 88, c: 'var(--slate)' },
  { ch: 'A', h: 62, c: 'var(--maroon)' },
]

export default function Footer() {
  const { t } = useLang()
  return (
    <footer className="foot">
      <div className="foot__mark" aria-hidden="true">
        {BLOCKS.map((b, i) => (
          <span key={i} style={{ height: `${b.h}%`, background: b.c, transitionDelay: `${i * 70}ms` }}>{b.ch}</span>
        ))}
      </div>
      <div className="foot__grid">
        <nav className="foot__links" aria-label="Footer">
          <Link to="/explore" viewTransition>{t('navExplore')}</Link>
          <Link to="/explore?open=1" viewTransition>{t('fOpen')}</Link>
          <Link to="/saved" viewTransition>{t('navSaved')}</Link>
          <a href="#how">{t('navAbout')}</a>
        </nav>
        <div className="foot__notes">
          <p>{t('footData')}</p>
          <p>
            {t('footPhotos')}: <a href="https://commons.wikimedia.org/wiki/File:A_glwaa_of_tea_on_the_Nile_in_Cairo.jpg">“A glwaa of tea on the Nile in Cairo”</a> by DawoudHusseini, <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a>;{' '}
            <a href="https://commons.wikimedia.org/w/index.php?curid=10331507">“Cafe Riche”</a> by Nableezy, <a href="https://creativecommons.org/licenses/by-sa/3.0/">CC BY-SA 3.0</a>;{' '}
            <a href="https://commons.wikimedia.org/w/index.php?curid=113464255">“Coffee House and Mosque Entrance, Cairo”</a> by Robert Charles Goff, CC0;{' '}
            <a href="https://commons.wikimedia.org/wiki/File:Cairo,_Street_Scene_(NBY_444066).jpg">“Cairo, Street Scene”</a>, public domain;{' '}
            <a href="https://www.rawpixel.com/image/13993463/image-people-art-clothing">“Coffee-shop, Cairo, Egypt”</a>, coloured lithograph, CC0;{' '}
            <a href="https://commons.wikimedia.org/w/index.php?curid=121354649">“Cairo, Talaat Harb Street”</a> by Vyacheslav Argenberg, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>. All via Wikimedia Commons or rawpixel.
          </p>
          <p>{t('footMade')} © 2026</p>
        </div>
      </div>
    </footer>
  )
}
