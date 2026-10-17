import { useEffect, useMemo, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet'
import { CAFES, CAFE_BY_ID, directionsUrl, distanceKm, instagramUrl, openState, osmUrl, weekHours } from '../lib/cafes'
import { useLang, type StringKey } from '../lib/i18n'
import { openLabel, setNote, toggleSaved, useCairoNow, useStore } from '../lib/store'
import CafeCard from '../components/CafeCard'
import Reveal from '../components/Reveal'
import '../styles/cafe.css'

export default function CafePage() {
  const { id = '' } = useParams()
  const { t, lang } = useLang()
  const now = useCairoNow()
  const { saved, notes } = useStore()
  const headRef = useRef<HTMLHeadingElement>(null)
  const cafe = CAFE_BY_ID.get(id)

  // after the route change, move focus to the new heading so screen readers announce the café
  useEffect(() => { headRef.current?.focus({ preventScroll: true }) }, [id])

  const nearby = useMemo(() => {
    if (!cafe) return []
    return CAFES.filter((c) => c.id !== cafe.id)
      .map((c) => ({ c, km: distanceKm(cafe.lat, cafe.lon, c.lat, c.lon) }))
      .sort((a, b) => a.km - b.km).slice(0, 4)
  }, [cafe])

  if (!cafe) {
    return (
      <div className="cafe-missing">
        <h1>{t('notFound')}</h1>
        <Link to="/explore" className="btn" viewTransition>{t('back')}</Link>
      </div>
    )
  }

  const state = openState(cafe, now)
  const week = weekHours(cafe, now)
  const isSaved = saved.includes(cafe.id)
  const note = notes[cafe.id] ?? {}
  const name = lang === 'ar' ? cafe.nameAr : cafe.name
  const other = lang === 'ar' ? cafe.name : cafe.nameAr
  const dayFmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'long' })

  const yesNo = (v?: boolean) => (v === undefined ? t('unknown') : v ? t('yes') : t('no'))
  const smoking: Record<string, StringKey> = { no: 'smokingNo', yes: 'smokingYes', outside: 'smokingOutside', separated: 'smokingSeparated', isolated: 'smokingSeparated' }
  const facts: [StringKey, string, boolean][] = [
    ['aWifi', yesNo(cafe.wifi), cafe.wifi !== undefined],
    ['aOutdoor', yesNo(cafe.outdoor), cafe.outdoor !== undefined],
    ['aAc', yesNo(cafe.ac), cafe.ac !== undefined],
    ['aSmoking', cafe.smoking ? (smoking[cafe.smoking] ? t(smoking[cafe.smoking]) : cafe.smoking) : t('unknown'), !!cafe.smoking],
    ['aTakeaway', yesNo(cafe.takeaway), cafe.takeaway !== undefined],
    ['aWheelchair', cafe.wheelchair ? (cafe.wheelchair === 'no' ? t('no') : t('yes')) : t('unknown'), !!cafe.wheelchair],
  ]

  return (
    <article className={'cafe cafe--' + state.status}>
      <header className="cafe__band">
        <Link to="/explore" className="cafe__back" viewTransition><span className="arr arr--back" aria-hidden="true">←</span> {t('back')}</Link>
        <p className="cafe__status">{openLabel(state, t)}</p>
        <h1 ref={headRef} tabIndex={-1} className="cafe__name" style={{ viewTransitionName: 'cafe-name' }}>{name}</h1>
        {other && other !== name && <p className="cafe__alt" lang={lang === 'ar' ? 'en' : 'ar'}>{other}</p>}
        <p className="cafe__where">
          {t('inArea', { a: lang === 'ar' ? cafe.areaAr : cafe.area })}{cafe.street && <> · {cafe.street}</>}{cafe.chain && <> · {t('chain')}</>}
        </p>
        <div className="cafe__actions">
          <button type="button" className={'btn ' + (isSaved ? 'btn--light' : 'btn--ghost-on')} aria-pressed={isSaved} onClick={() => toggleSaved(cafe.id)}>
            <svg viewBox="0 0 24 24" aria-hidden="true" className="ico"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg>
            {isSaved ? t('saved') : t('save')}
          </button>
          <a className="btn btn--light" href={directionsUrl(cafe)} target="_blank" rel="noreferrer">{t('directions')} <span className="arr" aria-hidden="true">→</span></a>
          {cafe.website && <a className="btn btn--ghost-on" href={cafe.website} target="_blank" rel="noreferrer">{t('website')}</a>}
          {cafe.instagram && <a className="btn btn--ghost-on" href={instagramUrl(cafe.instagram)} target="_blank" rel="noreferrer">{t('instagram')}</a>}
          {cafe.phone && <a className="btn btn--ghost-on" href={`tel:${cafe.phone.replace(/\s/g, '')}`}>{t('call')}</a>}
        </div>
      </header>

      <div className="cafe__body">
        <Reveal as="div" className="cafe__hours panel-block">
          <h2>{t('hoursHead')}</h2>
          {week ? (
            <table>
              <tbody>
                {week.map((d, i) => (
                  <tr key={i} className={i === 0 ? 'is-today' : undefined}>
                    <th scope="row">{i === 0 ? t('today') : dayFmt.format(d.day)}</th>
                    <td>{d.ranges.length ? d.ranges.join(', ') : t('closedAllDay')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : cafe.hours ? (
            <p>{t('hoursAsListed')}: <span dir="ltr">{cafe.hours}</span></p>
          ) : (
            <p className="muted">{t('unknownHours')}</p>
          )}
        </Reveal>

        <Reveal as="div" className="cafe__facts panel-block" delay={0.06}>
          <h2>{t('detailsHead')}</h2>
          <dl>
            {facts.map(([k, v, known]) => (
              <div key={k} className={known ? undefined : 'is-unknown'}><dt>{t(k)}</dt><dd>{v}</dd></div>
            ))}
          </dl>
        </Reveal>

        <Reveal as="div" className="cafe__notes panel-block" delay={0.12}>
          <h2>{t('notesHead')}</h2>
          <p className="muted">{t('notesLine')}</p>
          <fieldset>
            <legend>{t('quiet')}</legend>
            <div className="seg">
              {(['yes', 'mid', 'no'] as const).map((v) => (
                <button key={v} type="button" aria-pressed={note.quiet === v} onClick={() => setNote(cafe.id, { quiet: note.quiet === v ? undefined : v })}>
                  {t(v === 'yes' ? 'quietYes' : v === 'mid' ? 'quietMid' : 'quietNo')}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>{t('outlets')}</legend>
            <div className="seg">
              {[true, false].map((v) => (
                <button key={String(v)} type="button" aria-pressed={note.outlets === v} onClick={() => setNote(cafe.id, { outlets: note.outlets === v ? undefined : v })}>
                  {v ? t('yes') : t('no')}
                </button>
              ))}
            </div>
          </fieldset>
        </Reveal>

        <Reveal as="div" className="cafe__map" delay={0.06}>
          <div dir="ltr" className="minimap">
            <MapContainer center={[cafe.lat, cafe.lon]} zoom={16} zoomControl={false} dragging={false} scrollWheelZoom={false} doubleClickZoom={false} touchZoom={false} keyboard={false}>
              <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
              <CircleMarker center={[cafe.lat, cafe.lon]} radius={12} pathOptions={{ color: '#2a1110', weight: 3, fillColor: '#dc1928', fillOpacity: 1 }} />
            </MapContainer>
          </div>
          <a className="osm-link" href={osmUrl(cafe)} target="_blank" rel="noreferrer">{t('fixOsm')} <span className="arr" aria-hidden="true">→</span></a>
        </Reveal>
      </div>

      <section className="cafe__near" aria-labelledby="near-h">
        <h2 id="near-h">{t('nearbyHead')}</h2>
        <ol className="cards cards--grid">
          {nearby.map(({ c, km }, i) => (
            <CafeCard key={c.id} index={i} cafe={c} state={openState(c, now)} km={km} saved={saved.includes(c.id)} active={false} />
          ))}
        </ol>
      </section>
    </article>
  )
}
