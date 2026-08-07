'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(useGSAP, ScrollTrigger)

type RevealProps = {
  children: React.ReactNode
  delay?: number
  className?: string
  /** reveal on a timer instead of on scroll (for above-the-fold content) */
  immediate?: boolean
}

export default function Reveal({ children, delay = 0, className, immediate = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return
      gsap.fromTo(
        ref.current,
        { y: 24, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          delay,
          ease: 'power3.out',
          ...(immediate ? {} : { scrollTrigger: { trigger: ref.current, start: 'top 85%' } }),
        },
      )
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
