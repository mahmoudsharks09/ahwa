import { useEffect, useState, useSyncExternalStore } from 'react'
import { cairoNow } from './time'
import type { OpenState } from './cafes'
import type { useLang } from './i18n'

/* ---------- small persisted store (saved cafés, personal notes) ---------- */

type Notes = Record<string, { quiet?: 'yes' | 'mid' | 'no'; outlets?: boolean }>
type State = { saved: string[]; notes: Notes }

const KEY = 'ahwa-v1'
let state: State = { saved: [], notes: {} }
try {
  const raw = localStorage.getItem(KEY)
  if (raw) state = { ...state, ...JSON.parse(raw) }
} catch { /* private mode or blocked storage: start empty */ }

const listeners = new Set<() => void>()
function set(next: State) {
  state = next
  try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* keep in memory only */ }
  listeners.forEach((l) => l())
}
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export function useStore() {
  return useSyncExternalStore(subscribe, () => state)
}

export function toggleSaved(id: string) {
  const saved = state.saved.includes(id) ? state.saved.filter((x) => x !== id) : [id, ...state.saved]
  set({ ...state, saved })
}

export function setNote(id: string, patch: Notes[string]) {
  set({ ...state, notes: { ...state.notes, [id]: { ...state.notes[id], ...patch } } })
}

/* ---------- Cairo clock that ticks once a minute ---------- */

export function useCairoNow() {
  const [now, setNow] = useState(() => cairoNow())
  useEffect(() => {
    const id = setInterval(() => setNow(cairoNow()), 60_000)
    return () => clearInterval(id)
  }, [])
  return now
}

/* ---------- labels ---------- */

export function openLabel(s: OpenState, t: ReturnType<typeof useLang>['t']) {
  if (s.status === 'unknown') return t('unknownHours')
  if (s.status === 'open' && s.alwaysOpen) return t('open247')
  const m = s.minutesToChange
  const span = m === undefined ? '' : m < 60 ? t('min', { n: m }) : t('hr', { n: Math.round(m / 6) / 10 })
  if (s.status === 'open') return m !== undefined && m <= 180 ? `${t('open')} · ${t('closesIn', { t: span })}` : t('open')
  return m !== undefined && m <= 180 ? `${t('closed')} · ${t('opensIn', { t: span })}` : t('closed')
}

export function useReducedMotion() {
  const q = '(prefers-reduced-motion: reduce)'
  return useSyncExternalStore(
    (cb) => { const m = matchMedia(q); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) },
    () => matchMedia(q).matches,
  )
}

export function useMedia(q: string) {
  return useSyncExternalStore(
    (cb) => { const m = matchMedia(q); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) },
    () => matchMedia(q).matches,
  )
}
