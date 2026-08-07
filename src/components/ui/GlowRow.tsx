'use client'

import { restoreSceneBase, setScene } from '@/components/scene/sceneStore'

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
  return (
    <div
      className={className}
      onMouseEnter={() => setScene({ intensity, accent })}
      onMouseLeave={() => restoreSceneBase()}
    >
      {children}
    </div>
  )
}
