import type { Metadata } from 'next'
import Link from 'next/link'
import { education, roles, stack } from '@/content/experience'
import { getAllCases } from '@/lib/content'
import { getPosts } from '@/lib/medium'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Satvik Singh, the short version',
  description: site.description,
}

const M = 'https://medium.com/@satvik19nitm/'

const sideQuests = [
  {
    t: 'InvestIQ',
    d: 'My ET Money plan lapsed, so I built my own: an ML ensemble with walk-forward validation, FinBERT sentiment, and a trading bot where every order passes six risk checks.',
    href: 'https://github.com/zen7vik/InvestIQ',
  },
  {
    t: 'Bitcask, built then broken',
    d: 'A key value store in Go, then a week of SIGKILLs, torn writes and flipped bits. fsync on every write was 2,940x slower.',
    href: 'https://github.com/zen7vik/bitcask-case-study',
  },
  {
    t: 'Redis, measured',
    d: 'Every internal traced to source and measured. One more hash field, 512 to 513, costs 4.09x the memory.',
    href: `${M}one-thread-one-latency-budget-every-redis-internal-is-the-same-rule-wearing-a-different-costume-42b7f75cd637`,
  },
  {
    t: 'Grep vs RAG vs graphs',
    d: 'Four ways to give an AI agent code context, measured on 12 real questions. Plain grep was the most reliable.',
    href: `${M}i-measured-okf-rag-a-knowledge-graph-and-plain-grep-on-production-code-a426386651e8`,
  },
]

function H({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <h2 id={id} className="display-tight mt-20 scroll-mt-8 text-[1.9rem] text-[#1b1d24]">
      {children}
    </h2>
  )
}

export default async function ReadPage() {
  const cases = getAllCases()
  const posts = (await getPosts()).slice(0, 6)

  return (
    <main className="min-h-screen bg-[#f6f1ea] text-[#2b2e38] selection:bg-[#ff6a3d] selection:text-[#1b0b05]">
      <div className="mx-auto max-w-[42rem] px-5 pb-28 pt-10 md:pt-16">
        <nav className="flex items-center justify-between text-[0.92rem]">
          <Link href="/" className="font-semibold text-[#1b1d24] underline decoration-[#ff6a3d] decoration-2 underline-offset-4">
            Back to my room
          </Link>
          <a href={site.resumePath} download className="font-semibold text-[#1b1d24] underline decoration-[#ff6a3d] decoration-2 underline-offset-4">
            Resume (PDF)
          </a>
        </nav>

        <header className="mt-16">
          <p className="text-[1rem] text-[#5b5f6d]">The short version, for people in a hurry.</p>
          <h1 className="display mt-4 text-[clamp(2.8rem,9vw,4.4rem)] text-[#1b1d24]">Satvik Singh</h1>
          <p className="mt-6 text-[1.2rem] leading-relaxed text-[#2b2e38]">
            I&apos;m a fullstack AI engineer at Safe Security in Delhi. I own the risk-scoring engine that runs 72 million
            calculations a month across 6 production regions, and the Temporal workflow platform customers automate
            their vendor risk on. Mostly Go and TypeScript, with the AI plumbing that turns documents into answers.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-y border-[#1b1d24]/10 py-6">
            {[
              ['72M', 'risk calculations a month'],
              ['604 to 281 ms', 'p95 latency on the scoring API'],
              ['12.3% to 3.8%', 'workflow failure rate, at twice the volume'],
              ['1 second', 'cluster cutover that replaced a 1.5 hour freeze'],
            ].map(([v, l]) => (
              <li key={l}>
                <p className="display-tight text-[1.45rem] text-[#1b1d24]">{v}</p>
                <p className="mt-1 text-[0.92rem] leading-snug text-[#5b5f6d]">{l}</p>
              </li>
            ))}
          </ul>
        </header>

        <H id="work">Systems I own</H>
        <ol className="mt-6 space-y-7">
          {cases.map((c) => (
            <li key={c.slug}>
              <Link href={`/work/${c.slug}`} className="group block">
                <p className="text-[1.2rem] font-semibold leading-snug text-[#1b1d24] decoration-[#ff6a3d] decoration-2 underline-offset-4 group-hover:underline">
                  {c.title}
                </p>
                <p className="mt-1.5 text-[1.02rem] leading-relaxed">{c.hook}</p>
              </Link>
            </li>
          ))}
        </ol>

        <H id="experience">Where I&apos;ve worked</H>
        <div className="mt-6 space-y-12">
          {roles.map((r) => (
            <section key={r.company}>
              <p className="text-[1.2rem] font-semibold text-[#1b1d24]">
                {r.company}
                <span className="font-normal text-[#5b5f6d]">, {r.title}</span>
              </p>
              <p className="text-[0.95rem] text-[#5b5f6d]">
                {r.period}, {r.place}
              </p>
              <ul className="mt-4 space-y-3">
                {r.points.map((p, i) => (
                  <li key={i} className="flex gap-3 text-[1.02rem] leading-relaxed">
                    <span aria-hidden className="mt-[0.75em] h-[2px] w-3 shrink-0 bg-[#ff6a3d]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="text-[1rem]">
            {education.school}, {education.degree}, {education.detail}, {education.period}.
          </p>
          <dl className="space-y-2 text-[1rem]">
            {stack.map((s) => (
              <div key={s.label}>
                <dt className="inline font-semibold text-[#1b1d24]">{s.label}: </dt>
                <dd className="inline">{s.items}</dd>
              </div>
            ))}
          </dl>
        </div>

        <H id="projects">Side quests</H>
        <div className="mt-6 space-y-6">
          {sideQuests.map((q) => (
            <a key={q.t} href={q.href} target="_blank" rel="noopener noreferrer" className="group block">
              <p className="text-[1.15rem] font-semibold text-[#1b1d24] decoration-[#ff6a3d] decoration-2 underline-offset-4 group-hover:underline">
                {q.t}
              </p>
              <p className="mt-1 text-[1.02rem] leading-relaxed">{q.d}</p>
            </a>
          ))}
        </div>

        <H id="writing">Writing</H>
        <ul className="mt-6 space-y-4">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={p.contentHtml ? `/writing/${p.id}` : p.url} className="group block">
                <p className="text-[1.08rem] font-semibold leading-snug text-[#1b1d24] decoration-[#ff6a3d] decoration-2 underline-offset-4 group-hover:underline">
                  {p.title}
                </p>
                <p className="text-[0.9rem] text-[#5b5f6d]">{p.readingMinutes} min read</p>
              </Link>
            </li>
          ))}
        </ul>

        <H id="contact">Say hi</H>
        <p className="mt-4 text-[1.1rem] leading-relaxed">
          The fastest way is email:{' '}
          <a href={`mailto:${site.email}`} className="font-semibold text-[#1b1d24] underline decoration-[#ff6a3d] decoration-2 underline-offset-4">
            {site.email}
          </a>
          . I&apos;m also on{' '}
          <a href={site.github} className="underline decoration-[#ff6a3d] decoration-2 underline-offset-4">
            GitHub
          </a>
          ,{' '}
          <a href={site.linkedin} className="underline decoration-[#ff6a3d] decoration-2 underline-offset-4">
            LinkedIn
          </a>{' '}
          and{' '}
          <a href={site.medium} className="underline decoration-[#ff6a3d] decoration-2 underline-offset-4">
            Medium
          </a>
          .
        </p>
        <p className="mt-16 text-[0.95rem] text-[#5b5f6d]">
          If you skipped the room, it is worth one click.{' '}
          <Link href="/" className="font-semibold text-[#1b1d24] underline decoration-[#ff6a3d] decoration-2 underline-offset-4">
            There is a cat.
          </Link>
        </p>
      </div>
    </main>
  )
}
