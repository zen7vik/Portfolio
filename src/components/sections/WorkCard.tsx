'use client'

import { useRef } from 'react'
import { getScene, setScene } from '@/components/scene/sceneStore'
import TransitionLink from '@/components/scene/TransitionLink'
import type { CaseMeta } from '@/lib/content'

const ACCENT_HEX = { indigo: '#7c8cff', green: '#58c48f', amber: '#f0b35e', rose: '#f27a8a' } as const
const ACCENT_BORDER = {
  indigo: 'group-hover:border-indigo/60',
  green: 'group-hover:border-green/60',
  amber: 'group-hover:border-amber/60',
  rose: 'group-hover:border-rose/60',
} as const
const ACCENT_TEXT = {
  indigo: 'text-indigo',
  green: 'text-green',
  amber: 'text-amber',
  rose: 'text-rose',
} as const

export default function WorkCard({ meta, index }: { meta: CaseMeta; index: number }) {
  const prev = useRef<{ intensity: number; accent: string } | null>(null)

  return (
    <TransitionLink
      href={`/work/${meta.slug}`}
      className="group block"
      onMouseEnter={() => {
        const s = getScene()
        prev.current = { intensity: s.intensity, accent: s.accent }
        setScene({ intensity: 1.6, accent: ACCENT_HEX[meta.accent] })
      }}
      onMouseLeave={() => {
        if (prev.current) setScene(prev.current)
        prev.current = null
      }}
    >
      <article
        className={`rounded-2xl border border-fg/10 bg-bg/60 p-8 backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 ${ACCENT_BORDER[meta.accent]}`}
      >
        <div className="flex items-baseline justify-between">
          <span className={`font-mono text-sm ${ACCENT_TEXT[meta.accent]}`}>{String(index + 1).padStart(2, '0')}</span>
          <span className="font-mono text-xs text-muted transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold tracking-tight md:text-3xl">{meta.title}</h3>
        <p className="mt-3 text-muted">{meta.hook}</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {meta.stats.slice(0, 2).map((s) => (
            <span key={s.label} className="rounded-full border border-fg/15 px-3 py-1 font-mono text-xs text-muted">
              <span className="text-fg">{s.value}</span> {s.label}
            </span>
          ))}
        </div>
      </article>
    </TransitionLink>
  )
}
