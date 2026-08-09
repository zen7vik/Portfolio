'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(useGSAP, ScrollTrigger, ScrambleTextPlugin)

/** Heading that decodes into place as it scrolls into view. SSR renders the real text. */
export default function ScrambleTitle({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion() || !ref.current) return
      gsap.to(ref.current, {
        duration: 1.1,
        scrambleText: {
          text,
          chars: 'abcdefghijklmnopqrstuvwxyz<>/_',
          revealDelay: 0.15,
          speed: 1.2,
        },
        scrollTrigger: { trigger: ref.current, start: 'top 88%' },
      })
    },
    { scope: ref, dependencies: [text] },
  )

  return (
    <h2 ref={ref} className={className}>
      {text}
    </h2>
  )
}
