import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { animate, motion, useDragControls, useMotionValue, type PanInfo } from 'motion/react'
import { AREAS, CAFES, HOURS_KNOWN, distanceKm, openState, type OpenState } from '../lib/cafes'
import { useLang, type StringKey } from '../lib/i18n'
import { useCairoNow, useMedia, useReducedMotion, useStore } from '../lib/store'
import CafeCard from '../components/CafeCard'
import CafeMap from '../components/CafeMap'
import '../styles/explore.css'

const FLAGS = [
  ['open', 'fOpen'], ['wifi', 'fWifi'], ['outdoor', 'fOutdoor'], ['ac', 'fAc'], ['nosmoke', 'fNoSmoke'], ['local', 'fLocal'],
] as const satisfies readonly (readonly [string, StringKey])[]

type Me = { lat: number; lon: number } | null

export default function Explore() {
  const { t, lang, num } = useLang()
  const [params, setParams] = useSearchParams()
  const now = useCairoNow()
  const { saved } = useStore()
  const wide = useMedia('(min-width: 900px)')
  const [hovered, setHovered] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [me, setMe] = useState<Me>(null)
  const [locating, setLocating] = useState<'idle' | 'busy' | 'denied'>('idle')
  const listRef = useRef<HTMLOListElement>(null)

  useEffect(() => { const id = setTimeout(() => { import('./CafePage') }, 1200); return () => clearTimeout(id) }, [])

  const q = params.get('q') ?? ''
  const area = params.get('area') ?? ''
  const on = (k: string) => params.get(k) === '1'

  const setParam = useCallback((k: string, v: string | null) => {
    setParams((p) => { const n = new URLSearchParams(p); if (v) n.set(k, v); else n.delete(k); return n }, { replace: true })
  }, [setParams])

  const states = useMemo(() => {
    const m = new Map<string, OpenState>()
    for (const c of CAFES) m.set(c.id, openState(c, now))
    return m
  }, [now])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = CAFES.filter((c) => {
      if (needle && ![c.name, c.nameAr, c.area, c.areaAr, c.street ?? ''].some((s) => s.toLowerCase().includes(needle))) return false
      if (area && c.area !== area) return false
      if (on('open') && states.get(c.id)?.status !== 'open') return false
      if (on('wifi') && !c.wifi) return false
      if (on('outdoor') && !c.outdoor) return false
      if (on('ac') && !c.ac) return false
      if (on('nosmoke') && c.smoking !== 'no') return false
      if (on('local') && c.chain) return false
      return true
    })
    const withKm = list.map((c) => ({ c, km: me ? distanceKm(me.lat, me.lon, c.lat, c.lon) : undefined }))
    if (me) withKm.sort((a, b) => a.km! - b.km!)
    else {
      // open first, then cafés whose hours are known, then the rest; alphabetical within each
      const rank = (s?: OpenState) => (s?.status === 'open' ? 0 : s?.status === 'closed' ? 1 : 2)
      withKm.sort((a, b) => rank(states.get(a.c.id)) - rank(states.get(b.c.id)) || a.c.name.localeCompare(b.c.name))
    }
    return withKm
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, area, params, states, me])

  // a stable list for the map, so hovering a card does not rebuild every pin
  const mapCafes = useMemo(() => results.map((r) => r.c), [results])
  const fitKey = `${q}|${area}|${FLAGS.map(([k]) => (on(k) ? 1 : 0)).join('')}`
  const anyFilter = q || area || FLAGS.some(([k]) => on(k))

  const nearMe = () => {
    if (me) { setMe(null); return }
    if (!navigator.geolocation) { setLocating('denied'); return }
    setLocating('busy')
    navigator.geolocation.getCurrentPosition(
      (p) => { setMe({ lat: p.coords.latitude, lon: p.coords.longitude }); setLocating('idle') },
      () => setLocating('denied'),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    )
  }

  // a pin was tapped: bring its card into view
  const select = useCallback((id: string) => {
    setSelected(id)
    requestAnimationFrame(() => {
      listRef.current?.querySelector<HTMLElement>(`[data-id="${id}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    })
  }, [])

  const panel = (
    <div className="panel">
      <div className="panel__top">
        <label className="search">
          <span className="sr">{t('searchLabel')}</span>
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></svg>
          <input
            type="search" value={q} placeholder={t('searchPlaceholder')} enterKeyHint="search"
            onChange={(e) => setParam('q', e.target.value || null)}
          />
        </label>
        <div className="filters" role="group" aria-label="Filters">
          <button type="button" className={'fchip fchip--near' + (me ? ' is-on' : '')} aria-pressed={!!me} onClick={nearMe}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2 4 20l8-4 8 4z" /></svg>
            {locating === 'busy' ? t('locating') : t('nearMe')}
          </button>
          {FLAGS.map(([k, label]) => (
            <button key={k} type="button" className={'fchip' + (on(k) ? ' is-on' : '')} aria-pressed={on(k)} onClick={() => setParam(k, on(k) ? null : '1')}>
              {t(label)}
            </button>
          ))}
          <label className="fselect">
            <span className="sr">{t('fArea')}</span>
            <select value={area} onChange={(e) => setParam('area', e.target.value || null)}>
              <option value="">{t('fAllAreas')}</option>
              {AREAS.map((a) => <option key={a.en} value={a.en}>{lang === 'ar' ? a.ar : a.en} ({num(a.n)})</option>)}
            </select>
          </label>
        </div>
        <div className="panel__status">
          <p aria-live="polite"><strong>{results.length === 1 ? t('result1') : t('results', { n: results.length })}</strong></p>
          {anyFilter && <button type="button" className="linkish" onClick={() => setParams(new URLSearchParams(), { replace: true })}>{t('clearFilters')}</button>}
        </div>
        {locating === 'denied' && <p className="note">{t('locDenied')}</p>}
        {on('open') && <p className="note">{t('hoursNote', { k: HOURS_KNOWN, n: CAFES.length })}</p>}
      </div>
      {results.length === 0 ? (
        <div className="empty">
          <h2>{t('emptyHead')}</h2>
          <p>{t('emptyLine')}</p>
          <button type="button" className="btn" onClick={() => setParams(new URLSearchParams(), { replace: true })}>{t('clearFilters')}</button>
        </div>
      ) : (
        <ol className="cards" ref={listRef}>
          {results.map(({ c, km }, i) => (
            <CafeCard
              key={c.id} index={i}
              cafe={c} state={states.get(c.id)!} km={km}
              saved={saved.includes(c.id)} active={c.id === hovered || c.id === selected}
              onHover={setHovered}
            />
          ))}
        </ol>
      )}
    </div>
  )

  return (
    <div className="explore">
      <h1 className="sr">{t('navExplore')}</h1>
      {wide ? <aside className="explore__side">{panel}</aside> : <Sheet>{panel}</Sheet>}
      <section className="explore__map" aria-label={t('showMap')}>
        <CafeMap cafes={mapCafes} states={states} hovered={hovered} selected={selected} onSelect={select} me={me} fitKey={fitKey} />
      </section>
    </div>
  )
}

/* ---------------- phone: a sheet over the map, dragged by its handle, snapping to three heights ---------------- */

function Sheet({ children }: { children: React.ReactNode }) {
  const controls = useDragControls()
  const reduce = useReducedMotion()
  const y = useMotionValue(0)
  const [snap, setSnap] = useState(1)
  const h = () => window.innerHeight
  // offsets from the top of the sheet's fully-open position
  const points = () => [h() * 0.06, h() * 0.42, h() - 64 - 150]

  useEffect(() => {
    animate(y, points()[snap], reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 40 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snap])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const p = points()
    // a quick flick moves one step in its direction; otherwise settle on the nearest point
    if (Math.abs(info.velocity.y) > 500) setSnap((s) => Math.max(0, Math.min(2, s + (info.velocity.y > 0 ? 1 : -1))))
    else {
      const cur = y.get()
      const nearest = p.reduce((best, v, i) => (Math.abs(v - cur) < Math.abs(p[best] - cur) ? i : best), 0)
      if (nearest === snap) animate(y, p[nearest], { type: 'spring', stiffness: 380, damping: 40 })
      setSnap(nearest)
    }
  }

  return (
    <motion.div
      className="sheet"
      style={{ y }}
      drag="y"
      dragControls={controls}
      dragListener={false}
      dragConstraints={{ top: points()[0], bottom: points()[2] }}
      dragElastic={0.08}
      onDragEnd={onDragEnd}
    >
      <button
        type="button"
        className="sheet__handle"
        aria-label={snap === 2 ? 'Show list' : 'Show map'}
        onPointerDown={(e) => controls.start(e)}
        onClick={() => setSnap((s) => (s === 2 ? 1 : 2))}
        style={{ touchAction: 'none' }}
      >
        <i />
      </button>
      {children}
    </motion.div>
  )
}
