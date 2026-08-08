'use client'

import { useEffect } from 'react'
import type { Formation } from '@/components/scene/formations'
import { setSceneBase } from '@/components/scene/sceneStore'
import { prefersReducedMotion } from '@/lib/motion'

const SECTION_FORMATIONS: Record<string, { formation: Formation; intensity: number; accent: string }> = {
  hero: { formation: 'name', intensity: 1, accent: '#7c8cff' },
  about: { formation: 'sphere', intensity: 0.5, accent: '#7c8cff' },
  work: { formation: 'lattice', intensity: 0.45, accent: '#58c48f' },
  personal: { formation: 'helix', intensity: 0.4, accent: '#f0b35e' },
  writing: { formation: 'ambient', intensity: 0.5, accent: '#5ac8dd' },
  contact: { formation: 'vortex', intensity: 1, accent: '#f27a8a' },
}

function applySection(id: string) {
  const conf = SECTION_FORMATIONS[id]
  if (conf) setSceneBase({ formation: conf.formation, intensity: conf.intensity, accent: conf.accent })
}

export default function SectionMorpher() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    // establish the correct base immediately (covers back-nav scroll restoration
    // landing between sections, where the observer threshold may not fire)
    const mid = window.innerHeight / 2
    let bestId = 'hero'
    let bestDist = Infinity
    for (const id of Object.keys(SECTION_FORMATIONS)) {
      const r = document.getElementById(id)?.getBoundingClientRect()
      if (!r) continue
      const center = r.top + r.height / 2
      const dist = Math.abs(center - mid)
      if (dist < bestDist) {
        bestDist = dist
        bestId = id
      }
    }
    applySection(bestId)

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) applySection(entry.target.id)
        }
      },
      { threshold: 0.4 },
    )
    for (const id of Object.keys(SECTION_FORMATIONS)) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  return null
}
