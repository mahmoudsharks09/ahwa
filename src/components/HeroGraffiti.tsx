import { useId } from 'react'

// a few overspray dots around the piece, fixed so the art is the same on every load
const DOTS: [number, number, number, string][] = [
  [136, 228, 4, 'var(--ink)'], [128, 300, 3, 'var(--bone)'], [168, 470, 5, 'var(--mustard)'], [214, 486, 3, 'var(--mustard)'],
  [708, 214, 4, 'var(--mustard)'], [722, 300, 3, 'var(--ink)'], [700, 392, 5, 'var(--mustard)'], [664, 470, 3, 'var(--mustard)'],
  [390, 96, 3, 'var(--mustard)'], [560, 104, 4, 'var(--mustard)'], [612, 128, 2, 'var(--ink)'], [262, 128, 3, 'var(--mustard)'],
]

const star = 'M0 -22 L5 -5 L22 0 L5 5 L0 22 L-5 5 L-22 0 L-5 -5 Z'

/**
 * The hero's street piece: a stencilled glass of red tea on a sprayed mustard throw-up,
 * the word قهوة tagged across it, with a crown, an Eye of Horus and drips, in the poster palette.
 * Each part sprays on in turn (see .g-* in home.css); the noise filter roughens every edge like paint on plaster.
 */
export default function HeroGraffiti() {
  const id = useId().replace(/:/g, '')
  return (
    <svg viewBox="0 0 800 600" aria-hidden="true" focusable="false">
      <defs>
        <filter id={`spray-${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="7" />
          <feDisplacementMap in="SourceGraphic" scale="7" />
        </filter>
      </defs>
      <g filter={`url(#spray-${id})`}>
        {/* the throw-up behind everything, with its drips */}
        <g className="g-blob" style={{ '--d': '300ms' } as React.CSSProperties}>
          <path fill="var(--mustard)" d="M150 260 C160 150 300 110 420 120 C560 100 690 160 700 270 C715 370 650 450 540 470 C430 495 300 480 210 440 C140 405 140 330 150 260 Z" />
        </g>
        <g stroke="var(--mustard)" strokeWidth="14" strokeLinecap="round">
          <path className="g-drip" style={{ '--d': '900ms' } as React.CSSProperties} d="M262 446 V528" />
          <path className="g-drip" style={{ '--d': '980ms' } as React.CSSProperties} d="M318 466 V566" />
          <path className="g-drip" style={{ '--d': '1060ms' } as React.CSSProperties} d="M600 452 V522" />
          <path className="g-drip" style={{ '--d': '940ms' } as React.CSSProperties} d="M652 420 V478" />
        </g>

        {/* the stencilled tea glass on its saucer */}
        <g className="g-pop" style={{ '--d': '520ms' } as React.CSSProperties}>
          <path fill="var(--bone)" d="M380 150 L560 150 L538 462 Q536 476 522 476 L418 476 Q404 476 402 462 Z" />
          <path fill="var(--maroon)" d="M386 222 L554 222 L538 462 Q536 476 522 476 L418 476 Q404 476 402 462 Z" />
          <path stroke="var(--bone)" strokeWidth="11" strokeLinecap="round" fill="none" d="M408 246 L421 444" />
          <path stroke="var(--ink)" strokeWidth="6" strokeLinecap="round" fill="none" d="M392 222 Q430 236 470 222 T550 222" />
          <path fill="var(--ink)" d="M344 476 L596 476 L578 500 L362 500 Z" />
        </g>
        <path className="g-draw" style={{ '--d': '620ms' } as React.CSSProperties} pathLength={1}
          fill="none" stroke="var(--ink)" strokeWidth="10" strokeLinejoin="round"
          d="M380 150 L560 150 L538 462 Q536 476 522 476 L418 476 Q404 476 402 462 Z" />

        {/* steam rising off the tea */}
        <g fill="none" stroke="var(--bone)" strokeWidth="9" strokeLinecap="round">
          <path className="g-draw g-steam" style={{ '--d': '1200ms' } as React.CSSProperties} pathLength={1} d="M430 132 C406 106 452 92 428 60" />
          <path className="g-draw g-steam" style={{ '--d': '1300ms' } as React.CSSProperties} pathLength={1} d="M470 128 C446 96 494 82 470 36" />
          <path className="g-draw g-steam" style={{ '--d': '1400ms' } as React.CSSProperties} pathLength={1} d="M510 132 C486 106 532 92 508 60" />
        </g>

        {/* the tag, its crown and its drips, sprayed at an angle */}
        <g transform="rotate(-10 230 250)">
          <g className="g-pop" style={{ '--d': '820ms' } as React.CSSProperties}>
            <text x="232" y="290" textAnchor="middle" fontFamily="Lalezar, 'IBM Plex Sans Arabic', sans-serif" fontSize="168"
              fill="var(--ink)" stroke="var(--bone)" strokeWidth="14" strokeLinejoin="round" paintOrder="stroke" lang="ar">قهوة</text>
          </g>
          <g stroke="var(--ink)" strokeWidth="9" strokeLinecap="round">
            <path className="g-drip" style={{ '--d': '1250ms' } as React.CSSProperties} d="M160 286 V340" />
            <path className="g-drip" style={{ '--d': '1330ms' } as React.CSSProperties} d="M236 290 V372" />
            <path className="g-drip" style={{ '--d': '1290ms' } as React.CSSProperties} d="M312 284 V318" />
          </g>
          <path className="g-draw" style={{ '--d': '1100ms' } as React.CSSProperties} pathLength={1}
            fill="none" stroke="var(--bone)" strokeWidth="8" strokeLinejoin="round"
            d="M150 150 L158 108 L182 134 L198 96 L214 134 L238 108 L244 150 Z" />
        </g>

        {/* an Eye of Horus doodle on the right */}
        <g className="g-pop" style={{ '--d': '1050ms' } as React.CSSProperties}
          fill="none" stroke="var(--ink)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M592 262 Q640 228 694 262 Q640 284 592 262 Z" />
          <circle cx="642" cy="259" r="12" fill="var(--ink)" />
          <path d="M590 238 Q642 208 696 234" />
          <path d="M628 276 L618 318" />
          <path d="M650 276 Q664 312 690 304 Q702 292 688 286" />
        </g>

        {/* an arrow with a small tag, pointing at the glass */}
        <g fill="none" stroke="var(--bone)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
          <path className="g-draw" style={{ '--d': '1500ms' } as React.CSSProperties} pathLength={1} d="M150 540 C210 560 300 548 352 504" />
          <path className="g-draw" style={{ '--d': '1700ms' } as React.CSSProperties} pathLength={1} d="M318 500 L354 502 L348 538" />
        </g>
        <text className="g-pop" style={{ '--d': '1600ms' } as React.CSSProperties} x="104" y="528" fontFamily="Lalezar, 'IBM Plex Sans Arabic', sans-serif"
          fontSize="40" fill="var(--bone)" lang="ar" transform="rotate(-6 104 528)">القاهرة</text>

        {/* sparkles and overspray */}
        <g fill="var(--bone)">
          <path className="g-pop" style={{ '--d': '1450ms' } as React.CSSProperties} transform="translate(720 140)" d={star} />
          <path className="g-pop" style={{ '--d': '1550ms' } as React.CSSProperties} transform="translate(96 400) scale(.7)" d={star} />
          <path className="g-pop" style={{ '--d': '1650ms' } as React.CSSProperties} transform="translate(560 560) scale(.55)" d={star} />
        </g>
        <g className="g-pop" style={{ '--d': '700ms' } as React.CSSProperties}>
          {DOTS.map(([cx, cy, r, fill], i) => <circle key={i} cx={cx} cy={cy} r={r} fill={fill} />)}
        </g>
      </g>
    </svg>
  )
}
