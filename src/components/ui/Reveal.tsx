'use client'

import { motion, useReducedMotion } from 'motion/react'

export const EASE = [0.16, 1, 0.3, 1] as const

type RevealProps = {
  children: React.ReactNode
  delay?: number
  className?: string
  /** play on mount instead of on scroll (above-the-fold content) */
  immediate?: boolean
  y?: number
}

export default function Reveal({ children, delay = 0, className, immediate = false, y = 22 }: RevealProps) {
  const reduce = useReducedMotion()
  const to = { opacity: 1, y: 0 }
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      {...(immediate ? { animate: to } : { whileInView: to, viewport: { once: true, amount: 0.25 } })}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}
