import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useAnimate, useMotionValue, useScroll, useTransform, useSpring, type MotionValue } from 'motion/react'
import Lenis from 'lenis'
import { cairoNow } from '../lib/time'
import { useLang } from '../lib/i18n'
import { useReducedMotion } from '../lib/store'
import Reveal from '../components/Reveal'
import Footer from '../components/Footer'
import HeroGraffiti from '../components/HeroGraffiti'
import '../styles/home.css'

export default function Home() {
  const { t, lang } = useLang()
  const reduce = useReducedMotion()
  const counts = useLiveCounts()

  // smooth, weighted scrolling on the poster page only (the map keeps native scrolling)
  useEffect(() => {
    if (reduce) return
    const lenis = new Lenis({ lerp: 0.11 })
    let raf = requestAnimationFrame(function loop(time) { lenis.raf(time); raf = requestAnimationFrame(loop) })
    return () => { cancelAnimationFrame(raf); lenis.destroy() }
  }, [reduce])

  return (
    <div className="home" key={lang}>
      <Hero counts={counts} />
      <Board />
      <Showcase counts={counts} />
      <History />
      <How />
      <section className="cta" aria-labelledby="cta-h">
        <Reveal as="h2" id="cta-h" className="cta__head">
          <span>{t('ctaHead1')}</span><span>{t('ctaHead2')}</span>
        </Reveal>
        <div className="cta__foot">
          <Reveal as="p" className="cta__line">{t('ctaLine')}</Reveal>
          <Reveal delay={0.08}><Link to="/explore" className="btn btn--accent cta__btn" viewTransition>{t('openMap')} <span className="arr" aria-hidden="true">→</span></Link></Reveal>
        </div>
      </section>
      <Footer />
    </div>
  )
}

type Counts = { open: number; total: number; known: number } | null

/** Live counts from the real data. The data and the hours parser load after the first paint. */
function useLiveCounts(): Counts {
  const [counts, setCounts] = useState<Counts>(null)
  useEffect(() => {
    let live = true
    let timer: ReturnType<typeof setInterval> | undefined
    import('../lib/cafes').then(({ CAFES, HOURS_KNOWN, openState }) => {
      const calc = () => {
        const now = cairoNow()
        if (live) setCounts({ open: CAFES.filter((c) => openState(c, now).status === 'open').length, total: CAFES.length, known: HOURS_KNOWN })
      }
      calc()
      timer = setInterval(calc, 60_000)
    })
    return () => { live = false; clearInterval(timer) }
  }, [])
  return counts
}

/* ---------------- hero: a street piece on the wall, the headline bursting out of it ---------------- */

function Hero({ counts }: { counts: Counts }) {
  const { t, num } = useLang()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const artRef = useRef<HTMLElement>(null)
  const [headRef, animate] = useAnimate<HTMLHeadingElement>()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // the graffiti stays put; only the headline drifts up as you leave the first screen
  const headY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])

  // the graffiti pops in first (CSS), then the headline grows out of its middle, blurred to sharp
  useLayoutEffect(() => {
    const head = headRef.current, art = artRef.current
    if (reduce || !head || !art) return
    const h = head.getBoundingClientRect(), a = art.getBoundingClientRect()
    const dx = a.left + a.width / 2 - (h.left + h.width / 2)
    const dy = a.top + a.height / 2 - (h.top + h.height / 2)
    animate(head, { x: [dx, 0], y: [dy, 0], scale: [0.15, 1], opacity: [0, 1], filter: ['blur(28px)', 'blur(0px)'] },
      { duration: 1.1, delay: 0.6, ease: [0.16, 1, 0.3, 1] })
  }, [reduce, animate, headRef])

  // then the two lines lean toward the pointer, the second a little more, so they read as layers
  const px = useMotionValue(0), py = useMotionValue(0)
  const spring = { stiffness: 140, damping: 22, mass: 0.6 }
  const sx = useSpring(px, spring), sy = useSpring(py, spring)
  const x1 = useTransform(sx, (v) => v * 18), y1 = useTransform(sy, (v) => v * 10)
  const x2 = useTransform(sx, (v) => v * 34), y2 = useTransform(sy, (v) => v * 18)
  useEffect(() => {
    if (reduce || !matchMedia('(hover: hover) and (pointer: fine)').matches) return
    const move = (e: PointerEvent) => { px.set(e.clientX / innerWidth - 0.5); py.set(e.clientY / innerHeight - 0.5) }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [reduce, px, py])

  return (
    <section className="hero" ref={ref} aria-labelledby="hero-h">
      <motion.div className="hero__top" style={{ y: headY }}>
        <h1 id="hero-h" className="hero__head" ref={headRef} style={reduce ? undefined : { opacity: 0 }}>
          <motion.span style={{ x: x1, y: y1 }}>{t('heroLine1')}</motion.span>
          <motion.span style={{ x: x2, y: y2 }}>{t('heroLine2')}</motion.span>
        </h1>
      </motion.div>
      <figure className="hero__art" ref={artRef} role="img" aria-label={t('heroArt')}>
        <HeroGraffiti />
      </figure>
      <p className="hero__line">{t('heroSentence')}</p>
      <p className="hero__fact">
        <strong>{counts ? num(counts.open) : '–'}</strong> {t('openRightNow')}
        <span>{counts ? t('ofListed', { n: counts.known }) : '\u00a0'}</span>
      </p>
    </section>
  )
}

/* ---------------- features: close-ups of the interface on a board ---------------- */

function Board() {
  const { t } = useLang()
  const tiles: { cls: string; name: string; line: string; ui: React.ReactNode }[] = [
    { cls: 't-open', name: t('tOpenNow'), line: t('tOpenNowLine'), ui: <span className="ui-status"><i />{t('open')}</span> },
    { cls: 't-wifi', name: t('tWifi'), line: t('tWifiLine'), ui: <span className="ui-chip ui-chip--on">{t('fWifi')}</span> },
    { cls: 't-save', name: t('tSave'), line: t('tSaveLine'), ui: <span className="ui-save"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg></span> },
    { cls: 't-near', name: t('tNear'), line: t('tNearLine'), ui: <span className="ui-dist">650<small>m</small></span> },
    { cls: 't-lang', name: t('tLang'), line: t('tLangLine'), ui: <span className="ui-lang"><b>EN</b><b lang="ar">ع</b></span> },
    { cls: 't-closing', name: t('tClosing'), line: t('tClosingLine'), ui: <span className="ui-bar"><i /></span> },
    { cls: 't-outdoor', name: t('tOutdoor'), line: t('tOutdoorLine'), ui: <span className="ui-chip">{t('fOutdoor')}</span> },
  ]
  return (
    <section className="board" aria-labelledby="board-h">
      <Reveal className="tile t-head" as="div">
        <h2 id="board-h"><span>{t('boardHead1')}</span><span>{t('boardHead2')}</span></h2>
      </Reveal>
      {tiles.map((tile, i) => (
        <Reveal key={tile.cls} className={'tile ' + tile.cls} delay={0.05 * (i % 4)} as="div">
          <div className="tile__ui" data-ui aria-hidden="true">{tile.ui}</div>
          <p className="tile__cap"><strong>{tile.name}</strong>{tile.line}</p>
        </Reveal>
      ))}
    </section>
  )
}

/* ---------------- showcase: one control, blown up, and it works ---------------- */

function Showcase({ counts }: { counts: Counts }) {
  const { t, num } = useLang()
  const [on, setOn] = useState(true)
  const shown = counts ? (on ? counts.open : counts.total) : null
  return (
    <section className={'show' + (on ? ' show--on' : '')} aria-labelledby="show-h">
      <div className="show__text">
        <Reveal as="h2" id="show-h" className="show__head">{t('showHead')}</Reveal>
        <Reveal as="p" delay={0.06}>{t('showLine')}</Reveal>
        <Reveal delay={0.12}>
          <Link to={on ? '/explore?open=1' : '/explore'} className="btn show__link" viewTransition>{t('showSee')} <span className="arr" aria-hidden="true">→</span></Link>
        </Reveal>
      </div>
      <p className="show__count" aria-live="polite">
        <motion.span key={String(shown)} initial={{ y: '40%', opacity: 0 }} animate={{ y: '0%', opacity: 1 }} transition={{ type: 'spring', duration: 0.6, bounce: 0.18 }}>
          {shown === null ? '–' : num(shown)}
        </motion.span>
        <span className="show__count-label">{on ? t('showOn') : t('showOff')}</span>
      </p>
      <button
        type="button" role="switch" aria-checked={on} aria-label={t('fOpen')}
        className="big-switch" data-ui onClick={() => setOn((v) => !v)}
      >
        <span className="big-switch__label">{t('fOpen')}</span>
        <span className="big-switch__track">
          <motion.span className="big-switch__thumb" layout transition={{ type: 'spring', stiffness: 520, damping: 34 }} />
        </span>
      </button>
    </section>
  )
}

/* ---------------- history: archive pictures stuck on a maroon wall ---------------- */

function History() {
  const { t } = useLang()
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.4 })
  const a = useTransform(smooth, [0, 1], ['18%', '-22%'])
  const b = useTransform(smooth, [0, 1], ['34%', '-30%'])
  const c = useTransform(smooth, [0, 1], ['10%', '-12%'])
  const d = useTransform(smooth, [0, 1], ['26%', '-18%'])
  return (
    <section className="history" ref={ref} aria-labelledby="hist-h">
      <div className="history__text">
        <Reveal as="h2" id="hist-h" className="history__head"><span>{t('historyHead1')}</span><span>{t('historyHead2')}</span></Reveal>
        <Reveal as="p" delay={0.08}>{t('historyLine')}</Reveal>
      </div>
      <Stuck y={a} cls="p1" src="/img/coffee-house-etching.jpg" w={1600} h={1127} alt="Etching of a crowded Cairo coffee house beside a mosque entrance" cap="Coffee house and mosque entrance, etching by Robert Charles Goff" />
      <Stuck y={b} cls="p2" src="/img/street-postcard.jpg" w={1600} h={1049} alt="Coloured postcard of a busy Cairo street with bread sellers and lanterns" cap="Cairo street scene, early 1900s postcard" />
      <Stuck y={c} cls="p3" src="/img/cafe-riche.jpg" w={1600} h={958} alt="The wooden front of Café Riche in Downtown Cairo" cap="Café Riche, Downtown" />
      <Stuck y={d} cls="p4" src="/img/coffee-shop-litho.jpg" w={1024} h={735} alt="Lithograph of men drinking coffee under an arched Cairo coffee shop" cap="Coffee shop, Cairo, coloured lithograph" />
    </section>
  )
}

function Stuck({ y, cls, src, w, h, alt, cap }: { y: MotionValue<string>; cls: string; src: string; w: number; h: number; alt: string; cap: string }) {
  return (
    <motion.figure className={'stuck ' + cls} style={{ y }}>
      <img src={src} alt={alt} width={w} height={h} loading="lazy" decoding="async" />
      <figcaption>{cap}</figcaption>
    </motion.figure>
  )
}

/* ---------------- how it works: the stages as one bar ---------------- */

function How() {
  const { t } = useLang()
  const ref = useRef<HTMLOListElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 92%', 'start 35%'] })
  const grow = useSpring(useTransform(scrollYProgress, [0, 1], [0, 1]), { stiffness: 140, damping: 28 })
  const { dir } = useLang()
  // a wipe in reading direction (downwards on phones), so the words inside are never squashed
  const clip = useTransform(grow, (v) => {
    const rest = `${((1 - v) * 100).toFixed(2)}%`
    if (window.innerWidth <= 760) return `inset(0 0 ${rest} 0)`
    return dir === 'rtl' ? `inset(0 0 0 ${rest})` : `inset(0 ${rest} 0 0)`
  })
  const stages = [
    { time: t('howT1'), cap: t('howC1'), grow: 1, cls: 'seg-red' },
    { time: t('howT2'), cap: t('howC2'), grow: 2.2, cls: 'seg-mustard' },
    { time: t('howT3'), cap: t('howC3'), grow: 7, cls: 'seg-slate' },
  ]
  return (
    <section className="how" id="how" aria-labelledby="how-h">
      <Reveal as="h2" id="how-h" className="how__head">{t('howHead')}</Reveal>
      <ol className="how__bar" ref={ref} data-ui>
        {stages.map((s) => (
          <li key={s.cls} style={{ flexGrow: s.grow }}>
            <motion.div className={'how__seg ' + s.cls} style={{ clipPath: clip }}>
              <span>{s.time}</span>
            </motion.div>
            <p>{s.cap}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
