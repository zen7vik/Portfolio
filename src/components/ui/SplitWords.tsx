'use client'

import { motion, useReducedMotion } from 'motion/react'
import { EASE } from '@/components/ui/Reveal'

type Props = {
  text: string
  as?: 'h1' | 'h2' | 'p'
  className?: string
  delay?: number
  immediate?: boolean
  /** words rendered in the accent color */
  accent?: string[]
}

/** Headline that rises word by word out of a clipping mask. */
export default function SplitWords({ text, as = 'h2', className, delay = 0, immediate = false, accent = [] }: Props) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  const words = text.split(' ')
  const show = { transition: { staggerChildren: 0.055, delayChildren: delay } }

  return (
    <Tag
      className={className}
      aria-label={text}
      initial={reduce ? false : 'hidden'}
      {...(immediate
        ? { animate: 'show' }
        : { whileInView: 'show', viewport: { once: true, amount: 0.5 } })}
      variants={{ hidden: {}, show }}
    >
      {words.map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className={`inline-block ${accent.includes(word.replace(/[.,]/g, '')) ? 'text-accent' : ''}`}
            variants={{ hidden: { y: '105%' }, show: { y: '0%', transition: { duration: 0.95, ease: EASE } } }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </Tag>
  )
}
