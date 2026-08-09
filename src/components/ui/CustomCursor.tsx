'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { prefersReducedMotion } from '@/lib/motion'

/** Trailing dot that grows over interactive elements. Mouse-only devices. */
export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion()) return
    if (!window.matchMedia('(pointer: fine)').matches) return
    setEnabled(true)
  }, [])

  useEffect(() => {
    const el = dot.current
    if (!enabled || !el) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' })
    const onMove = (e: MouseEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      el.style.opacity = '1'
    }
    const onOver = (e: MouseEvent) => {
      const interactive = (e.target as HTMLElement).closest?.('a, button, [role="button"], input, kbd')
      gsap.to(el, { scale: interactive ? 2.6 : 1, duration: 0.3, ease: 'power3.out' })
    }
    const onLeave = () => {
      el.style.opacity = '0'
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeave)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[70] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 mix-blend-difference"
    />
  )
}
