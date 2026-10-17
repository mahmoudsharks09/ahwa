import { memo } from 'react'
import { Link, useViewTransitionState } from 'react-router-dom'
import { motion } from 'motion/react'
import { type Cafe, type OpenState } from '../lib/cafes'
import { useLang } from '../lib/i18n'
import { openLabel, toggleSaved } from '../lib/store'

type Props = {
  cafe: Cafe
  state: OpenState
  km?: number
  saved: boolean
  active: boolean
  onHover?: (id: string | null) => void
  index?: number
}

function CafeCard({ cafe, state, km, saved, active, onHover, index = 0 }: Props) {
  const { t, lang } = useLang()
  const to = `/cafe/${cafe.id}`
  // the name morphs into the café page heading during the route change
  const morphing = useViewTransitionState(to)
  const name = lang === 'ar' ? cafe.nameAr : cafe.name
  const area = lang === 'ar' ? cafe.areaAr : cafe.area
  const dist = km === undefined ? null : km < 1 ? t('mAway', { d: Math.round(km * 100) * 10 }) : t('kmAway', { d: km.toFixed(1) })

  return (
    <motion.li
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ duration: 0.4, delay: Math.min(index, 10) * 0.035, ease: [0.16, 1, 0.3, 1] }}
      className={'card' + (active ? ' card--active' : '')}
      data-id={cafe.id}
      onPointerEnter={() => onHover?.(cafe.id)}
      onPointerLeave={() => onHover?.(null)}
    >
      <Link to={to} className="card__link" viewTransition onFocus={() => onHover?.(cafe.id)} onBlur={() => onHover?.(null)}>
        <span className={'card__state card__state--' + state.status}>{openLabel(state, t)}</span>
        <h3 className="card__name" style={morphing ? { viewTransitionName: 'cafe-name' } : undefined}>{name}</h3>
        <span className="card__meta">
          {area}{cafe.chain && <> · {t('chain')}</>}{dist && <> · {dist}</>}
        </span>
        <span className="card__chips">
          {cafe.wifi && <span className="chip">{t('fWifi')}</span>}
          {cafe.outdoor && <span className="chip">{t('fOutdoor')}</span>}
          {cafe.ac && <span className="chip">{t('fAc')}</span>}
          {cafe.smoking === 'no' && <span className="chip">{t('fNoSmoke')}</span>}
        </span>
      </Link>
      <button
        type="button"
        className={'card__save' + (saved ? ' is-saved' : '')}
        aria-pressed={saved}
        aria-label={`${saved ? t('saved') : t('save')}: ${name}`}
        onClick={() => toggleSaved(cafe.id)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg>
      </button>
    </motion.li>
  )
}

export default memo(CafeCard)
