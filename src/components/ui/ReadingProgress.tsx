'use client'

import { motion, useScroll, useSpring } from 'motion/react'

/** Thin progress line for long-read pages; mount inside a sticky nav. */
export default function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 40, restDelta: 0.001 })

  return (
    <motion.div aria-hidden className="absolute bottom-[-1px] left-0 h-0.5 w-full origin-left bg-accent" style={{ scaleX }} />
  )
}
