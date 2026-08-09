'use client'

import { useEffect, useRef } from 'react'

/** Thin progress line for long-read pages; mount inside a sticky nav. */
export default function ReadingProgress({ accent }: { accent: string }) {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf = 0
    const update = () => {
      const el = bar.current
      if (el) {
        const max = document.documentElement.scrollHeight - window.innerHeight
        const p = max > 0 ? Math.min(1, window.scrollY / max) : 0
        el.style.transform = `scaleX(${p})`
      }
      raf = 0
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div
      ref={bar}
      aria-hidden
      className="absolute bottom-0 left-0 h-px w-full origin-left"
      style={{ transform: 'scaleX(0)', background: accent }}
    />
  )
}
