import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import SystemDiagram from '@/components/case/SystemDiagram'
import { getCaseDiagram } from '@/components/case/registry'
import { education, roles, stack } from '@/content/experience'
import { getAllCases } from '@/lib/content'
import { getPosts } from '@/lib/medium'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Satvik Singh, the short version',
  description: site.description,
}

const M = 'https://medium.com/@satvik19nitm/'

const quests = [
  {
    t: 'InvestIQ',
    big: '6 checks',
    cap: 'every automated trade passes',
    d: 'My ET Money plan lapsed, so I built my own: an ML ensemble with walk-forward validation, FinBERT sentiment, and a trading bot.',
    href: 'https://github.com/zen7vik/InvestIQ',
    tint: '#fde8d9',
  },
  {
    t: 'Bitcask, built then broken',
    big: '2,940x',
    cap: 'slower with fsync on every write',
    d: 'A key value store in Go, then a week of SIGKILLs, torn writes and flipped bits.',
    href: 'https://github.com/zen7vik/bitcask-case-study',
    tint: '#e3efe9',
  },
  {
    t: 'Redis, measured',
    big: '4.09x',
    cap: 'memory for one more hash field',
    d: 'Every internal traced to source and measured. One thread, one latency budget.',
    href: `${M}one-thread-one-latency-budget-every-redis-internal-is-the-same-rule-wearing-a-different-costume-42b7f75cd637`,
    tint: '#e6ecf7',
  },
  {
    t: 'Grep vs RAG vs graphs',
    big: '26:2',
    cap: 'wrong fact surfaced versus right one',
    d: 'Four ways to give an AI agent code context, on 12 real questions. Plain grep was the most reliable.',
    href: `${M}i-measured-okf-rag-a-knowledge-graph-and-plain-grep-on-production-code-a426386651e8`,
    tint: '#f6ecd0',
  },
  {
    t: 'Heimdall and Mochi',
    big: 'Heimdall',
    cap: 'my AI teammate in Slack',
    d: 'Reviews pull requests, reads failed builds and finds the first real error, and watches stuck PRs and deploys. Its dashboard has a golden puppy, Mochi, with her own little adventure game.',
    href: '/',
    tint: '#efe6fb',
  },
]

const numbers = [
  ['72M', 'risk calculations a month, 6 regions'],
  ['-53%', 'p95 latency, 604 to 281 ms'],
  ['3.8%', 'workflow failure rate, from 12.3%'],
  ['34', 'regressions stopped in review before merge, from 352 reviews in six months'],
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-t border-[#1b1d24]/10 py-20 md:py-28">
      <h2 className="reveal display-tight text-[clamp(2rem,4.4vw,3.2rem)] text-[#1b1d24]">{title}</h2>
      <div className="mt-10 md:mt-14">{children}</div>
    </section>
  )
}

export default async function ReadPage() {
  const cases = getAllCases()
  const posts = (await getPosts()).slice(0, 6)

  return (
    <main className="read-page min-h-screen bg-[#f6f1ea] text-[#2b2e38] selection:bg-[#ff6a3d] selection:text-[#1b0b05]">
      <header className="sticky top-0 z-30 border-b border-[#1b1d24]/[0.07] bg-[#f6f1ea]/85 backdrop-blur-md">
        <nav className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5 md:px-8">
          <Link href="/read" className="text-[0.98rem] font-bold tracking-tight text-[#1b1d24]">
            Satvik Singh
          </Link>
          <div className="flex items-center gap-2 text-[0.88rem] font-semibold">
            <a href={site.resumePath} download className="hidden rounded-full px-3.5 py-2 text-[#1b1d24] hover:bg-[#1b1d24]/[0.06] sm:inline-block">
              Resume
            </a>
            <Link href="/" className="rounded-full bg-[#1b1d24] px-4 py-2 text-[#f6f1ea] transition-transform hover:-translate-y-0.5">
              Enter the room
            </Link>
          </div>
        </nav>
      </header>

      <div className="mx-auto max-w-[1180px] px-5 md:px-8">
        {/* hero */}
        <section className="grid items-center gap-10 pb-16 pt-12 md:grid-cols-[1.15fr_1fr] md:gap-14 md:pb-24 md:pt-20">
          <div>
            <p className="hero-in text-[1rem] font-medium text-[#5b5f6d]" style={{ animationDelay: '0.05s' }}>
              Fullstack AI engineer, Delhi
            </p>
            <h1 className="hero-in display mt-4 text-[clamp(3rem,7.4vw,5.6rem)] text-[#1b1d24]" style={{ animationDelay: '0.12s' }}>
              Hi, I&apos;m Satvik.
            </h1>
            <p className="hero-in mt-6 max-w-[34rem] text-[1.2rem] leading-relaxed md:text-[1.3rem]" style={{ animationDelay: '0.22s' }}>
              I build backend systems that stay up and the AI plumbing behind them. At Safe Security I own the risk engine
              that runs 72 million calculations a month and the workflow platform customers automate on.
            </p>
            <div className="hero-in mt-8 flex flex-wrap gap-3" style={{ animationDelay: '0.32s' }}>
              <a
                href={`mailto:${site.email}`}
                className="rounded-full bg-[#ff6a3d] px-5 py-3 text-[0.98rem] font-bold text-[#1b0b05] shadow-[0_6px_0_#c8643b] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_8px_0_#c8643b] active:translate-y-1 active:shadow-[0_2px_0_#c8643b]"
              >
                Email me
              </a>
              <a href="#work" className="rounded-full border-2 border-[#1b1d24] px-5 py-2.5 text-[0.98rem] font-bold text-[#1b1d24] hover:bg-[#1b1d24] hover:text-[#f6f1ea]">
                See the work
              </a>
            </div>
          </div>
          <div className="hero-in relative mx-auto w-full max-w-[460px]" style={{ animationDelay: '0.18s' }}>
            <div className="overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-20px_rgba(27,29,36,0.45)] ring-1 ring-[#1b1d24]/10">
              <Image src="/art/satvik-wave.webp" alt="A toy version of Satvik waving from his desk" width={900} height={900} priority className="h-auto w-full" />
            </div>
            <p
              className="absolute -bottom-5 -left-4 rotate-[-6deg] rounded-sm bg-[#ffe066] px-4 py-2 text-[1.35rem] text-[#2b2b2b] shadow-[0_8px_18px_rgba(0,0,0,0.18)] md:-left-8"
              style={{ fontFamily: 'Caveat, cursive' }}
            >
              that&apos;s me, at 3am
            </p>
          </div>
        </section>

        {/* numbers */}
        <section aria-label="Numbers" className="reveal rounded-[2rem] bg-[#2f6f73] px-6 py-10 text-[#f6f1ea] md:px-12 md:py-12">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-9 lg:grid-cols-4">
            {numbers.map(([v, l]) => (
              <li key={l}>
                <p className="display text-[clamp(2.3rem,4.6vw,3.4rem)]">{v}</p>
                <p className="mt-2 text-[0.95rem] leading-snug text-[#f6f1ea]/80">{l}</p>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-[0.85rem] text-[#f6f1ea]/60">Measured in production over 30 days to September 2026.</p>
        </section>

        <Section id="work" title="Systems I own">
          <ol className="space-y-5">
            {cases.map((c, i) => {
              const diagram = getCaseDiagram(c.slug)
              return (
                <li key={c.slug} className="reveal">
                  <Link
                    href={`/work/${c.slug}`}
                    className="group grid items-center gap-6 rounded-[1.6rem] bg-white/70 p-6 ring-1 ring-[#1b1d24]/[0.07] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-24px_rgba(27,29,36,0.35)] md:grid-cols-[1fr_300px] md:p-8"
                  >
                    <div>
                      <p className="font-mono text-[0.85rem] text-[#c23a12]">0{i + 1}</p>
                      <h3 className="display-tight mt-2 text-[clamp(1.45rem,2.6vw,2rem)] text-[#1b1d24]">{c.title}</h3>
                      <p className="mt-3 max-w-[36rem] text-[1.04rem] leading-relaxed">{c.hook}</p>
                      <p className="mt-4 flex flex-wrap gap-2">
                        {c.stats.slice(0, 2).map((s) => (
                          <span key={s.label} className="rounded-full bg-[#1b1d24]/[0.06] px-3 py-1 text-[0.85rem]">
                            <b className="text-[#1b1d24]">{s.value}</b> {s.label}
                          </span>
                        ))}
                      </p>
                    </div>
                    {diagram && (
                      <div className="reader-diagram hidden rounded-2xl bg-[#fbf8f3] p-3 ring-1 ring-[#1b1d24]/[0.07] md:block">
                        <SystemDiagram diagram={diagram} active={[]} />
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ol>
        </Section>

        {/* the room, as an invitation */}
        <section className="reveal relative overflow-hidden rounded-[2rem] bg-[#efe3d2]">
          <Image src="/art/room-day.webp" alt="Satvik's toy room: a desk, a monitor, a cat on a beanbag, a server rack and a bookshelf" width={1800} height={1253} className="h-auto w-full" />
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 bg-gradient-to-t from-[#1b1d24]/80 via-[#1b1d24]/40 to-transparent p-6 pt-24 text-[#f6f1ea] md:flex-row md:items-end md:justify-between md:p-10">
            <p className="max-w-[30rem] text-[1.15rem] font-medium leading-snug md:text-[1.35rem]">
              The full version is a room you can walk into. The cat is called Kafka. There is an auto-rickshaw.
            </p>
            <Link href="/" className="w-fit rounded-full bg-[#f6f1ea] px-5 py-3 text-[0.98rem] font-bold text-[#1b1d24] transition-transform hover:-translate-y-0.5">
              Enter the room
            </Link>
          </div>
        </section>

        <Section id="experience" title="Where I've worked">
          <div className="space-y-14">
            {roles.map((r) => (
              <div key={r.company} className="reveal grid gap-5 md:grid-cols-[260px_1fr] md:gap-12">
                <div>
                  <p className="display-tight text-[1.6rem] text-[#1b1d24]">{r.company}</p>
                  <p className="mt-1 text-[0.98rem] font-medium">{r.title}</p>
                  <p className="text-[0.92rem] text-[#5b5f6d]">
                    {r.period}, {r.place}
                  </p>
                </div>
                <ul className="space-y-3.5">
                  {r.points.map((p, i) => (
                    <li key={i} className="flex gap-3 text-[1.04rem] leading-relaxed">
                      <span aria-hidden className="mt-[0.72em] size-2 shrink-0 rounded-full bg-[#ff6a3d]" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="reveal grid gap-5 md:grid-cols-[260px_1fr] md:gap-12">
              <p className="display-tight text-[1.6rem] text-[#1b1d24]">Toolbox</p>
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {stack.map((s) => (
                  <div key={s.label}>
                    <dt className="text-[0.9rem] font-semibold text-[#5b5f6d]">{s.label}</dt>
                    <dd className="mt-1 text-[1rem]">{s.items}</dd>
                  </div>
                ))}
                <div>
                  <dt className="text-[0.9rem] font-semibold text-[#5b5f6d]">Education</dt>
                  <dd className="mt-1 text-[1rem]">
                    {education.school}, {education.degree}, {education.detail}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Section>

        <Section id="projects" title="Side quests">
          <div className="grid gap-5 sm:grid-cols-2">
            {quests.map((q, i) => (
              <a
                key={q.t}
                href={q.href}
                target={q.href.startsWith('/') ? undefined : '_blank'}
                rel="noopener noreferrer"
                className={`reveal group flex flex-col rounded-[1.6rem] p-7 ring-1 ring-[#1b1d24]/[0.06] transition-transform duration-300 hover:-translate-y-1 hover:rotate-[-0.6deg] md:p-9 ${
                  i === quests.length - 1 && quests.length % 2 ? 'sm:col-span-2' : ''
                }`}
                style={{ background: q.tint }}
              >
                <p className="display text-[clamp(2.6rem,5vw,3.6rem)] text-[#1b1d24]">{q.big}</p>
                <p className="mt-1 text-[0.92rem] text-[#5b5f6d]">{q.cap}</p>
                <p className="mt-6 text-[1.2rem] font-bold text-[#1b1d24] decoration-[#ff6a3d] decoration-2 underline-offset-4 group-hover:underline">
                  {q.t}
                </p>
                <p className="mt-2 text-[1rem] leading-relaxed">{q.d}</p>
              </a>
            ))}
          </div>
        </Section>

        <Section id="writing" title="Writing">
          <ul className="grid gap-x-10 md:grid-cols-2">
            {posts.map((p) => (
              <li key={p.id} className="reveal border-t border-[#1b1d24]/10">
                <Link href={p.contentHtml ? `/writing/${p.id}` : p.url} className="group block py-6">
                  <p className="text-[0.88rem] text-[#5b5f6d]">
                    {new Date(p.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}, {p.readingMinutes} min read
                  </p>
                  <p className="mt-2 text-[1.2rem] font-semibold leading-snug text-[#1b1d24] decoration-[#ff6a3d] decoration-2 underline-offset-4 group-hover:underline">
                    {p.title}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Section>

        <section id="contact" className="reveal mb-16 overflow-hidden rounded-[2rem] bg-[#1b1d24] px-6 py-14 text-[#f6f1ea] md:px-14 md:py-20">
          <h2 className="display text-[clamp(2.4rem,6vw,4.4rem)]">Say hi.</h2>
          <p className="mt-4 max-w-[32rem] text-[1.15rem] leading-relaxed text-[#f6f1ea]/80">
            I like talking about distributed systems, AI infrastructure, and anything on this page. I reply to email.
          </p>
          <a
            href={`mailto:${site.email}`}
            className="mt-8 inline-block break-all rounded-full bg-[#ff6a3d] px-6 py-3.5 text-[1.05rem] font-bold text-[#1b0b05] shadow-[0_6px_0_#c8643b] transition-transform hover:-translate-y-0.5"
          >
            {site.email}
          </a>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-[1rem] font-semibold">
            {[
              ['GitHub', site.github],
              ['LinkedIn', site.linkedin],
              ['Medium', site.medium],
            ].map(([l, h]) => (
              <a key={l} href={h} target="_blank" rel="noopener noreferrer" className="underline decoration-[#ff6a3d] decoration-2 underline-offset-4">
                {l}
              </a>
            ))}
            <a href={site.resumePath} download className="underline decoration-[#ff6a3d] decoration-2 underline-offset-4">
              Resume
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}
