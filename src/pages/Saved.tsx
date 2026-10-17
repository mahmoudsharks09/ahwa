import { Link } from 'react-router-dom'
import { AnimatePresence } from 'motion/react'
import { CAFE_BY_ID, openState } from '../lib/cafes'
import { useLang } from '../lib/i18n'
import { useCairoNow, useStore } from '../lib/store'
import CafeCard from '../components/CafeCard'
import Reveal from '../components/Reveal'
import '../styles/cafe.css'

export default function Saved() {
  const { t } = useLang()
  const now = useCairoNow()
  const { saved } = useStore()
  const cafes = saved.map((id) => CAFE_BY_ID.get(id)).filter((c) => c !== undefined)

  return (
    <div className="saved">
      <header className="saved__band">
        <Reveal as="h1" className="saved__head">{t('savedHead')}</Reveal>
        <img src="/img/talaat-harb.jpg" alt="Talaat Harb Street in Downtown Cairo on a bright afternoon" width="1600" height="1067" className="saved__photo" />
      </header>
      {cafes.length === 0 ? (
        <div className="empty empty--saved">
          <h2>{t('savedEmptyHead')}</h2>
          <p>{t('savedEmptyLine')}</p>
          <Link to="/explore" className="btn btn--accent" viewTransition>{t('openMap')} <span className="arr" aria-hidden="true">→</span></Link>
        </div>
      ) : (
        <ol className="cards cards--grid saved__list">
          <AnimatePresence initial={false}>
            {cafes.map((c, i) => (
              <CafeCard key={c.id} index={i} cafe={c} state={openState(c, now)} saved active={false} />
            ))}
          </AnimatePresence>
        </ol>
      )}
    </div>
  )
}
