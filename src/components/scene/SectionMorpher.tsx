'use client'

import { useEffect } from 'react'
import type { Formation } from '@/components/scene/formations'
import { setScene } from '@/components/scene/sceneStore'
import { prefersReducedMotion } from '@/lib/motion'

const SECTION_FORMATIONS: Record<string, { formation: Formation; intensity: number }> = {
  hero: { formation: 'name', intensity: 1 },
  about: { formation: 'sphere', intensity: 0.4 },
  work: { formation: 'lattice', intensity: 0.7 },
  misc: { formation: 'lattice', intensity: 0.55 },
  writing: { formation: 'ambient', intensity: 0.5 },
  contact: { formation: 'vortex', intensity: 1 },
}

export default function SectionMorpher() {
  useEffect(() => {
    if (prefersReducedMotion()) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const conf = SECTION_FORMATIONS[entry.target.id]
          if (conf) {
            setScene({
              formation: conf.formation,
              intensity: conf.intensity,
              accent: entry.target.id === 'work' ? '#58c48f' : '#7c8cff',
            })
          }
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
