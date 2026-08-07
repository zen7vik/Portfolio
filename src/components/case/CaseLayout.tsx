import TransitionLink from '@/components/scene/TransitionLink'
import CaseSceneSetter from '@/components/case/CaseSceneSetter'
import type { Formation } from '@/components/scene/formations'
import Reveal from '@/components/ui/Reveal'
import type { CaseMeta } from '@/lib/content'

const ACCENTS = { indigo: '#7c8cff', green: '#58c48f', amber: '#f0b35e', rose: '#f27a8a' } as const

// every case page gets its own particle shape
const CASE_FORMATIONS: Record<string, Formation> = {
  'workflow-platform': 'helix',
  'risk-engine': 'wave',
  'rag-pipeline': 'torus',
  'data-exchange': 'twin',
}

export default function CaseLayout({
  meta,
  prev,
  next,
  children,
}: {
  meta: CaseMeta
  prev: CaseMeta | null
  next: CaseMeta | null
  children: React.ReactNode
}) {
  const accent = ACCENTS[meta.accent]
  const formation = CASE_FORMATIONS[meta.slug] ?? 'ambient'

  return (
    <main className="text-scrim">
      <CaseSceneSetter accent={accent} formation={formation} />
      <nav className="sticky top-0 z-20 border-b border-fg/10 bg-bg/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 md:px-12">
          <TransitionLink href="/" className="font-mono text-sm text-muted transition-colors hover:text-fg">
            ← satvik
          </TransitionLink>
          <span className="font-mono text-xs text-muted/70">work / {meta.slug}</span>
        </div>
      </nav>

      <header className="mx-auto max-w-5xl px-6 pb-16 pt-24 md:px-12">
        <Reveal immediate>
          <p className="font-mono text-xs uppercase tracking-[0.25em]" style={{ color: accent }}>
            Case study
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight md:text-6xl">{meta.title}</h1>
          <p className="mt-5 max-w-2xl text-xl text-muted">{meta.hook}</p>
        </Reveal>
        <Reveal immediate delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-sm text-muted">
            <span>{meta.role}</span>
            <span>{meta.period}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {meta.stats.map((s) => (
              <span key={s.label} className="rounded-full border border-fg/15 px-3 py-1.5 font-mono text-xs text-muted">
                <span className="text-fg">{s.value}</span> {s.label}
              </span>
            ))}
          </div>
        </Reveal>
      </header>

      <article className="case-prose mx-auto max-w-5xl px-6 pb-24 md:px-12">{children}</article>

      <footer className="mx-auto max-w-5xl border-t border-fg/10 px-6 py-12 md:px-12">
        <div className="flex items-center justify-between gap-6">
          {prev ? (
            <TransitionLink href={`/work/${prev.slug}`} className="group max-w-[45%]">
              <span className="font-mono text-xs text-muted">← previous</span>
              <p className="mt-1 font-display font-semibold transition-colors group-hover:text-indigo">{prev.title}</p>
            </TransitionLink>
          ) : (
            <span />
          )}
          {next ? (
            <TransitionLink href={`/work/${next.slug}`} className="group max-w-[45%] text-right">
              <span className="font-mono text-xs text-muted">next →</span>
              <p className="mt-1 font-display font-semibold transition-colors group-hover:text-indigo">{next.title}</p>
            </TransitionLink>
          ) : (
            <span />
          )}
        </div>
      </footer>
    </main>
  )
}
