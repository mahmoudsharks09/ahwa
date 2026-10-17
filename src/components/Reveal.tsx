import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '../lib/store'

type Tag = 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'li' | 'span'

/**
 * A section part that rises into place the first time it scrolls into view.
 * Distance and timing follow the page's motion scale: 24px, 700ms, strong ease-out, once.
 */
export default function Reveal({
  as = 'div', children, className, id, delay = 0,
}: { as?: Tag; children: ReactNode; className?: string; id?: string; delay?: number }) {
  const reduce = useReducedMotion()
  const M = motion[as] as typeof motion.div
  return (
    <M
      id={id}
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: reduce ? 0.3 : 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </M>
  )
}
