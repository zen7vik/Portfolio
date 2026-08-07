'use client'

import { setScene } from '@/components/scene/sceneStore'
import TransitionLink from '@/components/scene/TransitionLink'
import type { CaseMeta } from '@/lib/content'

export default function WorkCard({ meta, index }: { meta: CaseMeta; index: number }) {
  const accentClass = meta.accent === 'green' ? 'group-hover:border-green/60' : 'group-hover:border-indigo/60'
  const accentText = meta.accent === 'green' ? 'text-green' : 'text-indigo'

  return (
    <TransitionLink
      href={`/work/${meta.slug}`}
      className="group block"
      onMouseEnter={() => setScene({ intensity: 1.6 })}
      onMouseLeave={() => setScene({ intensity: 0.7 })}
    >
      <article
        className={`rounded-2xl border border-fg/10 bg-bg/60 p-8 backdrop-blur-sm transition-all duration-300 group-hover:-translate-y-1 ${accentClass}`}
      >
        <div className="flex items-baseline justify-between">
          <span className={`font-mono text-sm ${accentText}`}>{String(index + 1).padStart(2, '0')}</span>
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
