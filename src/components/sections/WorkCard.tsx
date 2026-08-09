'use client'

import { restoreSceneBase, setScene } from '@/components/scene/sceneStore'
import TransitionLink from '@/components/scene/TransitionLink'
import type { CaseMeta } from '@/lib/content'

const ACCENT_HEX = { indigo: '#7c8cff', green: '#58c48f', amber: '#f0b35e', rose: '#f27a8a' } as const
const ACCENT_TEXT = {
  indigo: 'group-hover:text-indigo',
  green: 'group-hover:text-green',
  amber: 'group-hover:text-amber',
  rose: 'group-hover:text-rose',
} as const

export default function WorkCard({ meta, index }: { meta: CaseMeta; index: number }) {
  return (
    <TransitionLink
      href={`/work/${meta.slug}`}
      className="group block border-t border-fg/10 last:border-b"
      onMouseEnter={() => setScene({ intensity: 1.6, accent: ACCENT_HEX[meta.accent] })}
      onMouseLeave={() => restoreSceneBase()}
    >
      <article className="grid gap-2 py-10 transition-transform duration-500 ease-out group-hover:translate-x-3 md:grid-cols-[3rem_1fr_auto] md:items-baseline md:gap-6">
        <span className="font-mono text-xs text-muted/70">{String(index + 1).padStart(2, '0')}</span>
        <div>
          <h3
            className={`font-display text-3xl font-medium tracking-tight transition-colors duration-300 md:text-5xl ${ACCENT_TEXT[meta.accent]}`}
          >
            {meta.title}
          </h3>
          <p className="mt-3 max-w-xl text-muted">{meta.hook}</p>
          <p className="mt-4 font-mono text-xs text-muted/80">
            {meta.stats.map((s, i) => (
              <span key={s.label} className={i >= 2 ? 'hidden sm:inline' : undefined}>
                {s.value} {s.label}
                {i < meta.stats.length - 1 && <span className={`mx-2 text-muted/50 ${i >= 1 ? 'hidden sm:inline' : ''}`}>·</span>}
              </span>
            ))}
          </p>
        </div>
        <span className="hidden font-display text-2xl italic text-muted/50 transition-all duration-300 group-hover:translate-x-2 group-hover:text-fg md:block">
          →
        </span>
      </article>
    </TransitionLink>
  )
}
