import Link from 'next/link'
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react/dist/ssr'
import Reveal from '@/components/ui/Reveal'
import SplitWords from '@/components/ui/SplitWords'
import SubNav from '@/components/ui/SubNav'
import type { CaseMeta } from '@/lib/content'

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
  return (
    <>
      <SubNav back="/" label="Case study" />
      <main>
        <header className="mx-auto max-w-[1320px] px-5 pb-14 pt-16 md:px-10 md:pt-24">
          <Reveal immediate>
            <p className="text-[0.95rem] text-fg-2">
              {meta.role}, {meta.period}
            </p>
          </Reveal>
          <SplitWords
            as="h1"
            immediate
            delay={0.1}
            text={meta.title}
            className="display mt-5 max-w-5xl text-[clamp(2.5rem,6vw,5rem)]"
          />
          <Reveal immediate delay={0.45}>
            <p className="mt-7 max-w-[44rem] text-lg leading-relaxed text-fg-2 md:text-xl md:leading-relaxed">
              {meta.summary}
            </p>
          </Reveal>
          <Reveal immediate delay={0.6}>
            <dl className="mt-12 grid grid-cols-1 border-y border-line sm:grid-cols-3">
              {meta.stats.map((s, i) => (
                <div key={s.label} className={`py-6 sm:px-6 ${i ? 'border-t border-line sm:border-l sm:border-t-0' : 'sm:pl-0'}`}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="display block text-[2.6rem] text-fg">{s.value}</span>
                    <span className="mt-2 block text-[0.95rem] text-muted">{s.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </header>

        <article className="mx-auto max-w-[1320px] px-5 pb-24 md:px-10">{children}</article>

        <footer className="border-t border-line">
          <div className="mx-auto grid max-w-[1320px] gap-px md:grid-cols-2">
            {prev ? (
              <Link href={`/work/${prev.slug}`} className="group px-5 py-12 md:px-10">
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <ArrowLeft size={14} /> Previous
                </span>
                <span className="display-tight mt-3 block text-2xl text-fg transition-colors group-hover:text-accent-ink">
                  {prev.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`/work/${next.slug}`} className="group px-5 py-12 text-right md:border-l md:border-line md:px-10">
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  Next <ArrowRight size={14} />
                </span>
                <span className="display-tight mt-3 block text-2xl text-fg transition-colors group-hover:text-accent-ink">
                  {next.title}
                </span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </footer>
      </main>
    </>
  )
}
