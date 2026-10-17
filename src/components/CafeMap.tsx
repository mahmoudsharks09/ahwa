import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Cafe, OpenState } from '../lib/cafes'
import { useLang } from '../lib/i18n'
import { useReducedMotion } from '../lib/store'

type Props = {
  cafes: Cafe[]
  states: Map<string, OpenState>
  hovered: string | null
  selected: string | null
  onSelect: (id: string) => void
  me: { lat: number; lon: number } | null
  fitKey: string
}

const CAIRO: [number, number] = [30.045, 31.27]

/** Re-frames the map when the filtered set changes (not on every hover). */
function Fit({ cafes, fitKey, me }: { cafes: Cafe[]; fitKey: string; me: Props['me'] }) {
  const map = useMap()
  const reduce = useReducedMotion()
  useEffect(() => {
    const pts = cafes.map((c) => [c.lat, c.lon] as [number, number])
    if (me) pts.push([me.lat, me.lon])
    if (pts.length === 0) return
    const b = L.latLngBounds(pts)
    // a map with no size yet (hidden, or mid page transition) cannot animate; just frame it
    const sized = map.getSize().x > 0 && map.getSize().y > 0
    try {
      if (!sized) map.fitBounds(b, { padding: [48, 48], maxZoom: 15, animate: false })
      else if (pts.length === 1) map.flyTo(pts[0], 15, { duration: reduce ? 0 : 0.8 })
      else map.flyToBounds(b, { padding: [48, 48], maxZoom: 15, duration: reduce ? 0 : 0.9 })
    } catch { /* the map is being torn down; nothing to frame */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitKey, me])
  return null
}

/** Keeps the map sized to its box when the layout around it changes. */
function Resize() {
  const map = useMap()
  useEffect(() => {
    const ro = new ResizeObserver(() => { try { map.invalidateSize() } catch { /* unmounting */ } })
    ro.observe(map.getContainer())
    return () => ro.disconnect()
  }, [map])
  return null
}

function Focus({ id, cafes }: { id: string | null; cafes: Cafe[] }) {
  const map = useMap()
  const reduce = useReducedMotion()
  useEffect(() => {
    const c = id && cafes.find((x) => x.id === id)
    if (!c) return
    try {
      if (map.getSize().x > 0) map.flyTo([c.lat, c.lon], Math.max(map.getZoom(), 15), { duration: reduce ? 0 : 0.7 })
      else map.setView([c.lat, c.lon], 15, { animate: false })
    } catch { /* map not ready */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])
  return null
}

const COLORS = { open: '#dc1928', closed: '#952625', unknown: '#2a1110' }

type Pin = { m: L.CircleMarker; status: OpenState['status'] }

/**
 * The café pins, created directly in Leaflet (not as React children) so that Leaflet owns their DOM,
 * including the hover labels. Style updates touch only the pins that changed.
 */
function Pins({ cafes, states, hovered, selected, onSelect }: Omit<Props, 'me' | 'fitKey'>) {
  const map = useMap()
  const { lang } = useLang()
  const pins = useRef(new Map<string, Pin>())
  const select = useRef(onSelect)
  select.current = onSelect

  // add and remove pins as the filtered set changes
  useEffect(() => {
    const layer = L.layerGroup().addTo(map)
    const made = new Map<string, Pin>()
    for (const c of cafes) {
      const status = states.get(c.id)?.status ?? 'unknown'
      const m = L.circleMarker([c.lat, c.lon], style(status, false))
        .bindTooltip(lang === 'ar' ? c.nameAr : c.name, { direction: 'top', offset: [0, -8], opacity: 1, className: 'map-tip' })
        .on('click', () => select.current(c.id))
        .addTo(layer)
      made.set(c.id, { m, status })
    }
    pins.current = made
    return () => { layer.remove(); pins.current = new Map() }
  }, [map, cafes, states, lang])

  // highlight the hovered and the selected café, and draw them on top
  useEffect(() => {
    for (const [id, p] of pins.current) {
      const on = id === hovered || id === selected
      p.m.setStyle(style(p.status, on)).setRadius(on ? 11 : p.status === 'unknown' ? 5 : 7)
      if (on) p.m.bringToFront()
    }
  }, [hovered, selected, cafes, states])

  return null
}

function style(status: OpenState['status'], on: boolean): L.CircleMarkerOptions {
  return {
    radius: on ? 11 : status === 'unknown' ? 5 : 7,
    color: on ? '#2a1110' : '#f8f6f2', weight: on ? 3 : 1.5,
    fillColor: on ? '#e0a912' : COLORS[status], fillOpacity: status === 'unknown' && !on ? 0.55 : 1,
  }
}

export default function CafeMap({ cafes, states, hovered, selected, onSelect, me, fitKey }: Props) {
  return (
    <div className="map" dir="ltr">
      <MapContainer center={CAIRO} zoom={12} minZoom={10} maxZoom={18} zoomControl={false} preferCanvas attributionControl>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={19}
        />
        <Pins cafes={cafes} states={states} hovered={hovered} selected={selected} onSelect={onSelect} />
        {me && (
          <CircleMarker center={[me.lat, me.lon]} radius={9} pathOptions={{ color: '#f8f6f2', weight: 3, fillColor: '#4a6f84', fillOpacity: 1 }} />
        )}
        <Fit cafes={cafes} fitKey={fitKey} me={me} />
        <Focus id={selected} cafes={cafes} />
        <Resize />
      </MapContainer>
    </div>
  )
}
