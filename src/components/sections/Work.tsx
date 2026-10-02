'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowRight } from '@phosphor-icons/react'
import SystemDiagram from '@/components/case/SystemDiagram'
import { getCaseDiagram } from '@/components/case/registry'
import Reveal, { EASE } from '@/components/ui/Reveal'
import SplitWords from '@/components/ui/SplitWords'
import type { CaseMeta } from '@/lib/content'

export default function Work({ cases }: { cases: CaseMeta[] }) {
  const [active, setActive] = useState(0)
  const [step, setStep] = useState(0)
  const reduce = useReducedMotion()
  const current = cases[active]
  const diagram = getCaseDiagram(current.slug)

  // walk the preview diagram through its steps so it reads as a live system
  useEffect(() => {
    setStep(0)
    if (reduce || !diagram) return
    const id = setInterval(() => setStep((s) => (s + 1) % diagram.steps.length), 2200)
    return () => clearInterval(id)
  }, [active, reduce, diagram])

  return (
    <section id="work" className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-36">
      <SplitWords text="Systems I own in production" className="display-tight text-[clamp(2.2rem,4.6vw,3.9rem)]" />
      <Reveal delay={0.1}>
        <p className="mt-5 max-w-[38rem] text-lg leading-relaxed text-fg-2">
          Five systems, each with the problem, the design, and what I would change. Every number comes from
          production telemetry.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-14">
        <ol className="lg:col-span-7">
          {cases.map((c, i) => (
            <li key={c.slug} className="border-t border-line last:border-b">
              <Reveal delay={i * 0.05}>
                <Link
                  href={`/work/${c.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 py-7 md:py-8"
                >
                  <span
                    className={`tabular font-mono text-sm transition-colors duration-300 ${
                      active === i ? 'text-accent' : 'text-muted'
                    }`}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>
                    <span
                      className={`display-tight block text-[clamp(1.45rem,2.5vw,2.1rem)] transition-colors duration-300 ${
                        active === i ? 'text-fg' : 'text-fg/80'
                      }`}
                    >
                      {c.title}
                    </span>
                    <span className="mt-2 block max-w-[36rem] text-[0.98rem] leading-relaxed text-fg-2">{c.hook}</span>
                    <span className="mt-3 flex flex-wrap gap-x-5 gap-y-1 lg:hidden">
                      {c.stats.slice(0, 2).map((s) => (
                        <span key={s.label} className="text-sm text-muted">
                          <span className="font-semibold text-fg">{s.value}</span> {s.label}
                        </span>
                      ))}
                    </span>
                  </span>
                  <ArrowRight
                    size={22}
                    className={`self-center transition-all duration-500 ${
                      active === i ? 'translate-x-0 text-accent opacity-100' : '-translate-x-2 text-muted opacity-0'
                    } group-hover:translate-x-0 group-hover:opacity-100`}
                    style={{ transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)' }}
                  />
                </Link>
              </Reveal>
            </li>
          ))}
        </ol>

        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-24 overflow-hidden rounded-2xl border border-line bg-raised/60">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                <div className="px-6 pt-6">
                  <p className="text-sm text-muted">{current.role}</p>
                  <p className="text-sm text-muted">{current.period}</p>
                </div>
                {diagram && (
                  <div className="px-4 py-2">
                    <SystemDiagram diagram={diagram} active={diagram.steps[step]?.highlight ?? []} />
                  </div>
                )}
                <div className="grid grid-cols-3 border-t border-line">
                  {current.stats.map((s, i) => (
                    <div key={s.label} className={`px-5 py-5 ${i ? 'border-l border-line' : ''}`}>
                      <p className="display-tight text-2xl text-fg">{s.value}</p>
                      <p className="mt-1.5 text-[0.8rem] leading-snug text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
