'use client'

import { motion, useReducedMotion } from 'motion/react'
import { ArrowUpRight } from '@phosphor-icons/react'
import Reveal, { EASE } from '@/components/ui/Reveal'
import SplitWords from '@/components/ui/SplitWords'

type Link = { label: string; href: string }

function Links({ links, onAccent }: { links: Link[]; onAccent?: boolean }) {
  return (
    <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-7">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group inline-flex items-center gap-1 text-[0.92rem] font-medium ${
            onAccent ? 'text-on-accent' : 'text-fg'
          }`}
        >
          <span className="link-line">{l.label}</span>
          <ArrowUpRight
            size={14}
            weight="bold"
            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      ))}
    </div>
  )
}

const RISK_LAYERS = ['Score gate', 'Position cap', 'Daily trade limit', 'Drawdown kill switch', 'Macro veto', 'Market hours']

function RiskLayers() {
  const reduce = useReducedMotion()
  return (
    <ol className="flex flex-col gap-1.5">
      {RISK_LAYERS.map((l, i) => (
        <motion.li
          key={l}
          initial={reduce ? false : { opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, delay: 0.15 + i * 0.08, ease: EASE }}
          className="flex items-center justify-between gap-4 rounded-lg border border-line bg-bg px-3.5 py-2"
        >
          <span className="text-[0.9rem] text-fg">{l}</span>
          <span className="tabular font-mono text-xs text-muted">L{i + 1}</span>
        </motion.li>
      ))}
    </ol>
  )
}

function FsyncBars() {
  const reduce = useReducedMotion()
  // log scale: 244 vs 717,000 writes per second
  const rows = [
    { label: 'fsync off', value: '717K writes/s', pct: 100 },
    { label: 'fsync every write', value: '244 writes/s', pct: Math.round((Math.log10(244) / Math.log10(717000)) * 1000) / 10 },
  ]
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={r.label}>
          <div className="flex justify-between text-[0.82rem] text-on-accent/80">
            <span>{r.label}</span>
            <span className="tabular font-mono">{r.value}</span>
          </div>
          <motion.div
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-on-accent/10"
            initial={reduce ? false : 'hidden'}
            whileInView="show"
            viewport={{ once: true, amount: 0.8 }}
          >
            <motion.div
              className="h-full origin-left rounded-full bg-on-accent"
              style={{ width: `${r.pct}%` }}
              variants={{
                hidden: { scaleX: 0 },
                show: { scaleX: 1, transition: { duration: 1.2, delay: 0.2 + i * 0.15, ease: EASE } },
              }}
            />
          </motion.div>
        </div>
      ))}
      <p className="text-xs text-on-accent/70">Log scale, Apple M4 Max, Go 1.25</p>
    </div>
  )
}

function BigFigure({ value, caption }: { value: string; caption: string }) {
  return (
    <div className="mb-6">
      <p className="display text-[3.4rem] text-fg">{value}</p>
      <p className="mt-2 text-sm text-muted">{caption}</p>
    </div>
  )
}

const cell = 'flex h-full flex-col rounded-2xl border border-line p-6 md:p-8'

export default function Projects() {
  return (
    <section id="projects" className="border-t border-line">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-36">
        <SplitWords text="Things I build for fun" className="display-tight text-[clamp(2.2rem,4.6vw,3.9rem)]" />
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-[38rem] text-lg leading-relaxed text-fg-2">
            Side projects and studies where I build something, measure it, and try to break it.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-6">
          <Reveal className="md:col-span-4">
            <article className={`${cell} bg-raised/60 md:grid md:grid-cols-[1fr_15rem] md:gap-10`}>
              <div className="flex flex-col">
                <p className="text-sm text-muted">Python, React, ML</p>
                <h3 className="display-tight mt-3 text-[1.9rem] text-fg">InvestIQ</h3>
                <p className="mt-3 text-[1.02rem] leading-relaxed text-fg-2">
                  My ET Money subscription lapsed, so I built the thing myself: stock scoring, an XGBoost and
                  random-forest ensemble with walk-forward validation, FinBERT news sentiment, risk-parity portfolios,
                  and an automated trading engine where every order passes six risk checks.
                </p>
                <Links
                  links={[
                    { label: 'Code', href: 'https://github.com/zen7vik/InvestIQ' },
                    { label: 'The story', href: 'https://medium.com/@satvik19nitm/my-et-money-subscription-lapsed-so-i-built-the-thing-myself-af0be8d6e98e' },
                  ]}
                />
              </div>
              <div className="mt-8 md:mt-0">
                <RiskLayers />
              </div>
            </article>
          </Reveal>

          <Reveal delay={0.08} className="md:col-span-2">
            <article className={`${cell} border-transparent bg-accent text-on-accent`}>
              <p className="text-sm text-on-accent/75">Go, storage engines</p>
              <h3 className="display-tight mt-3 text-[1.6rem]">Bitcask, built then broken</h3>
              <p className="mt-3 mb-7 text-[0.98rem] leading-relaxed text-on-accent/85">
                A key value store from scratch, then a week of SIGKILLs, torn writes, and flipped bits. Two silent bugs
                only failure tests could find.
              </p>
              <FsyncBars />
              <Links
                onAccent
                links={[
                  { label: 'Code', href: 'https://github.com/zen7vik/bitcask-case-study' },
                  {
                    label: 'Read it',
                    href: 'https://medium.com/@satvik19nitm/i-built-the-simplest-key-value-store-i-could-then-spent-a-week-trying-to-break-it-f3181cdeb970',
                  },
                ]}
              />
            </article>
          </Reveal>

          <Reveal delay={0.04} className="md:col-span-2">
            <article className={cell}>
              <BigFigure value="4.09x" caption="memory jump going from 512 to 513 hash fields" />
              <h3 className="display-tight text-[1.4rem] text-fg">Redis, measured</h3>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-fg-2">
                Every Redis internal traced to source and measured. One rule explains them all: one thread, one latency
                budget.
              </p>
              <Links
                links={[
                  {
                    label: 'Read it',
                    href: 'https://medium.com/@satvik19nitm/one-thread-one-latency-budget-every-redis-internal-is-the-same-rule-wearing-a-different-costume-42b7f75cd637',
                  },
                ]}
              />
            </article>
          </Reveal>

          <Reveal delay={0.08} className="md:col-span-2">
            <article className={cell}>
              <BigFigure value="26:2" caption="times retrieval surfaced a wrong fact, against 2 for the right one" />
              <h3 className="display-tight text-[1.4rem] text-fg">Grep vs RAG vs graphs</h3>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-fg-2">
                Four ways to give an AI agent context, measured on 12 real questions across two production codebases.
                Plain grep was the most reliable.
              </p>
              <Links
                links={[
                  {
                    label: 'Read it',
                    href: 'https://medium.com/@satvik19nitm/i-measured-okf-rag-a-knowledge-graph-and-plain-grep-on-production-code-a426386651e8',
                  },
                ]}
              />
            </article>
          </Reveal>

          <Reveal delay={0.12} className="md:col-span-2">
            <article className={`${cell} bg-raised/60`}>
              <BigFigure value="15" caption="repositories with daily code knowledge graphs" />
              <h3 className="display-tight text-[1.4rem] text-fg">Tools my team uses</h3>
              <p className="mt-3 text-[0.98rem] leading-relaxed text-fg-2">
                A CI pipeline that keeps code knowledge graphs fresh across services, and Heimdall, a Slack AI code
                reviewer that teammates now ask for by name.
              </p>
            </article>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
