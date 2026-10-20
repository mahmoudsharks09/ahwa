import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useAnimate, useMotionValue, useScroll, useTransform, useSpring, type MotionValue, type Variants } from 'motion/react'
import Lenis from 'lenis'
import { cairoNow } from '../lib/time'
import { useLang } from '../lib/i18n'
import { useMedia, useReducedMotion } from '../lib/store'
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

/* ---------------- hero: a street piece sprays itself on, then the headline bursts out of it ---------------- */

function Hero({ counts }: { counts: Counts }) {
  const { t, num } = useLang()
  const reduce = useReducedMotion()
  const ref = useRef<HTMLElement>(null)
  const artRef = useRef<HTMLElement>(null)
  const [headRef, animate] = useAnimate<HTMLHeadingElement>()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  // the graffiti stays put; only the headline drifts up as you leave the first screen
  const headY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%'])

  // The graffiti sprays itself on (CSS), big in the middle of the screen. As it finishes it settles
  // into its place under the headline, and the headline grows out of its middle, blurred to sharp.
  // With reduced motion nothing travels or scales: the piece draws in place and the headline fades in.
  useLayoutEffect(() => {
    const hero = ref.current, art = artRef.current, head = headRef.current
    if (!hero || !art || !head) return
    const ease = [0.16, 1, 0.3, 1] as const
    const settle = 1.45
    // a leftover blur(0) would make the browser re-filter the headline on every mouse-follow frame
    // (a frame later, because the animation writes its own final value after onComplete)
    const clearBlur = () => requestAnimationFrame(() => { head.style.filter = 'none' })
    if (reduce) {
      const fade = animate(head, { opacity: [0, 1], filter: ['blur(12px)', 'blur(0px)'] }, { delay: 1.1, duration: 0.8, onComplete: clearBlur })
      return () => fade.stop()
    }
    // measure where both really sit, without anything a previous run left behind
    art.style.transform = head.style.transform = ''
    const r = hero.getBoundingClientRect(), a = art.getBoundingClientRect(), h = head.getBoundingClientRect()
    // the middle of the part of the hero you can see, on any screen
    const cx = r.left + r.width / 2
    const cy = r.top + Math.min(r.height, innerHeight) / 2
    const s = Math.max(1, Math.min(1.35, (innerWidth * 0.94) / a.width, (innerHeight * 0.7) / a.height))
    const ax = cx - (a.left + a.width / 2), ay = cy - (a.top + a.height / 2)
    art.style.transform = `translate(${ax}px, ${ay}px) scale(${s})`
    const move = animate(art, { x: [ax, 0], y: [ay, 0], scale: [s, 1] }, { delay: settle, duration: 1, ease })
    const hx = cx - (h.left + h.width / 2), hy = cy - (h.top + h.height / 2)
    const burst = animate(head, { x: [hx, 0], y: [hy, 0], scale: [0.15, 1], opacity: [0, 1], filter: ['blur(24px)', 'blur(0px)'] },
      { delay: settle, duration: 1.1, ease, onComplete: clearBlur })
    return () => { move.stop(); burst.stop() }
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
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [reduce, px, py])

  return (
    <section className="hero" ref={ref} aria-labelledby="hero-h">
      <motion.div className="hero__top" style={{ y: headY }}>
        <h1 id="hero-h" className="hero__head" ref={headRef} style={{ opacity: 0 }}>
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

// the board's own curves, matching --ease-out and --ease-in-out in base.css
const EASE_OUT = [0.16, 1, 0.3, 1] as const
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const
const STEP = 0.07

// each tile wipes open from its bottom edge, then the interface piece inside it settles in;
// `custom` is the tile's place in reading order, so the board fills top-left to bottom-right
const tileIn: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
  shown: (i: number) => ({ clipPath: 'inset(0% 0% 0% 0%)', transition: { duration: 0.7, ease: EASE_IN_OUT, delay: i * STEP } }),
}
const popIn: Variants = {
  hidden: { opacity: 0, transform: 'scale(0.9)' },
  shown: (i: number) => ({ opacity: 1, transform: 'scale(1)', transition: { duration: 0.6, ease: EASE_OUT, delay: i * STEP + 0.3 } }),
}
// stacked on a phone each tile watches itself, and a fully clipped element never registers
// as in view, so there the tiles rise instead of wiping
const tileRise: Variants = {
  hidden: { opacity: 0, transform: 'translateY(24px)' },
  shown: { opacity: 1, transform: 'translateY(0px)', transition: { duration: 0.7, ease: EASE_OUT } },
}
// reduced motion: no wipe or scale, just a short fade
const tileFade: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.3 } },
}
const popFade: Variants = { hidden: { opacity: 1 }, shown: { opacity: 1 } }

function Board() {
  const { t } = useLang()
  const reduce = useReducedMotion()
  // on the wide grid the whole board is on screen at once, so it plays as one sequence;
  // stacked on a phone it's too tall for that, so each tile starts as it scrolls in
  const wide = useMedia('(min-width: 761px)')
  // `order` is the tile's position on the wide grid, read row by row
  const tiles: { cls: string; order: number; name: string; line: string; ui: React.ReactNode }[] = [
    { cls: 't-open', order: 3, name: t('tOpenNow'), line: t('tOpenNowLine'), ui: <span className="ui-status"><i />{t('open')}</span> },
    { cls: 't-wifi', order: 1, name: t('tWifi'), line: t('tWifiLine'), ui: <span className="ui-chip ui-chip--on">{t('fWifi')}</span> },
    { cls: 't-save', order: 2, name: t('tSave'), line: t('tSaveLine'), ui: <span className="ui-save"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg></span> },
    { cls: 't-near', order: 4, name: t('tNear'), line: t('tNearLine'), ui: <span className="ui-dist">650<small>m</small></span> },
    { cls: 't-lang', order: 5, name: t('tLang'), line: t('tLangLine'), ui: <span className="ui-lang"><b>EN</b><b lang="ar">ع</b></span> },
    { cls: 't-closing', order: 6, name: t('tClosing'), line: t('tClosingLine'), ui: <span className="ui-bar"><i /></span> },
    { cls: 't-outdoor', order: 7, name: t('tOutdoor'), line: t('tOutdoorLine'), ui: <span className="ui-chip">{t('fOutdoor')}</span> },
  ]
  const tileV = reduce ? tileFade : wide ? tileIn : tileRise
  const popV = reduce ? popFade : popIn
  const inView = { initial: 'hidden', whileInView: 'shown', viewport: { once: true, amount: 0.3 } } as const
  return (
    <motion.section className="board" aria-labelledby="board-h" {...(wide ? inView : {})}>
      <motion.div className="tile t-head" variants={tileV} custom={0} {...(wide ? {} : inView)}>
        <h2 id="board-h"><span>{t('boardHead1')}</span><span>{t('boardHead2')}</span></h2>
      </motion.div>
      {tiles.map((tile) => {
        const i = wide ? tile.order : 0
        return (
          <motion.div key={tile.cls} className={'tile ' + tile.cls} variants={tileV} custom={i} {...(wide ? {} : inView)}>
            <div className="tile__ui" data-ui aria-hidden="true">
              <motion.span className="tile__pop" variants={popV} custom={i}>{tile.ui}</motion.span>
            </div>
            <p className="tile__cap"><strong>{tile.name}</strong>{tile.line}</p>
          </motion.div>
        )
      })}
    </motion.section>
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
