import OpeningHours from 'opening_hours'
import raw from '../data/cafes.json'

export type Cafe = {
  id: string
  name: string
  nameAr: string
  lat: number
  lon: number
  area: string
  areaAr: string
  hours?: string
  wifi?: boolean
  wifiFree?: boolean
  outdoor?: boolean
  ac?: boolean
  smoking?: string
  takeaway?: boolean
  wheelchair?: string
  chain?: boolean
  cuisine?: string
  street?: string
  phone?: string
  website?: string
  instagram?: string
}

export const CAFES = raw as Cafe[]
export const CAFE_BY_ID = new Map(CAFES.map((c) => [c.id, c]))

/** Areas ordered by how many cafés they hold, for the area filter. */
export const AREAS = (() => {
  const counts = new Map<string, { en: string; ar: string; n: number }>()
  for (const c of CAFES) {
    const a = counts.get(c.area) ?? { en: c.area, ar: c.areaAr, n: 0 }
    a.n++
    counts.set(c.area, a)
  }
  return [...counts.values()].sort((a, b) => b.n - a.n)
})()

import { cairoNow } from './time'
export { cairoNow }

const parsed = new Map<string, OpeningHours | null>()
function hoursOf(c: Cafe): OpeningHours | null {
  if (!c.hours) return null
  if (!parsed.has(c.id)) {
    try {
      parsed.set(c.id, new OpeningHours(c.hours, { lat: c.lat, lon: c.lon, address: { country_code: 'eg', state: '' } }))
    } catch {
      parsed.set(c.id, null) // listed, but in a format the parser cannot read; shown as written
    }
  }
  return parsed.get(c.id) ?? null
}

export type OpenState =
  | { status: 'unknown' }
  | { status: 'open' | 'closed'; minutesToChange?: number; alwaysOpen?: boolean }

export function openState(c: Cafe, now: Date): OpenState {
  const oh = hoursOf(c)
  if (!oh) return { status: 'unknown' }
  const open = oh.getState(now)
  const next = oh.getNextChange(now)
  const minutesToChange = next ? Math.round((next.getTime() - now.getTime()) / 60000) : undefined
  return { status: open ? 'open' : 'closed', minutesToChange, alwaysOpen: open && !next }
}

/** The week from today as "06:00–03:00" style ranges per day (Cairo time). Spans past midnight stay whole. */
export function weekHours(c: Cafe, now: Date): { day: Date; ranges: string[] }[] | null {
  const oh = hoursOf(c)
  if (!oh) return null
  const DAY = 86_400_000
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const pad = (n: number) => String(n).padStart(2, '0')
  const hm = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`
  // ask for a little more than the week so a span that began yesterday or ends next week is complete
  const raw = oh.getOpenIntervals(new Date(start.getTime() - DAY), new Date(start.getTime() + 8 * DAY))
  const merged: [Date, Date][] = []
  for (const [a, b] of raw) {
    const last = merged[merged.length - 1]
    if (last && last[1].getTime() === a.getTime()) last[1] = b
    else merged.push([a, b])
  }
  const days = Array.from({ length: 7 }, (_, i) => ({ day: new Date(start.getFullYear(), start.getMonth(), start.getDate() + i), ranges: [] as string[] }))
  for (const [a, b] of merged) {
    const i = Math.floor((a.getTime() - start.getTime()) / DAY)
    if (i < 0 || i > 6) continue
    if (b.getTime() - a.getTime() >= DAY) { days[i].ranges.push('24h'); continue }
    const endsMidnight = hm(b) === '00:00'
    days[i].ranges.push(`${hm(a)}–${endsMidnight ? '24:00' : hm(b)}`)
  }
  return days
}

export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number) {
  const r = (x: number) => (x * Math.PI) / 180
  const dLat = r(bLat - aLat), dLon = r(bLon - aLon)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(aLat)) * Math.cos(r(bLat)) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

export function osmUrl(c: Cafe) {
  const type = c.id[0] === 'n' ? 'node' : 'way'
  return `https://www.openstreetmap.org/${type}/${c.id.slice(1)}`
}

export function directionsUrl(c: Cafe) {
  return `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lon}`
}

export function instagramUrl(handle: string) {
  if (/^https?:/.test(handle)) return handle
  return `https://www.instagram.com/${handle.replace(/^@/, '')}`
}

export const HOURS_KNOWN = CAFES.filter((c) => c.hours).length
