'use client'

import { useRef } from 'react'
import { getScene, setScene } from '@/components/scene/sceneStore'

/** Wraps content so hovering it makes the particle field glow in an accent color. */
export default function GlowRow({
  accent,
  intensity = 1.5,
  className,
  children,
}: {
  accent: string
  intensity?: number
  className?: string
  children: React.ReactNode
}) {
  const prev = useRef<{ intensity: number; accent: string } | null>(null)

  return (
    <div
      className={className}
      onMouseEnter={() => {
        const s = getScene()
        prev.current = { intensity: s.intensity, accent: s.accent }
        setScene({ intensity, accent })
      }}
      onMouseLeave={() => {
        if (prev.current) setScene(prev.current)
        prev.current = null
      }}
    >
      {children}
    </div>
  )
}
