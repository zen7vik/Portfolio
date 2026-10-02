'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, X } from '@phosphor-icons/react'
import SystemDiagram from '@/components/case/SystemDiagram'
import { getCaseDiagram } from '@/components/case/registry'
import { closeReader, useReaderTarget } from '@/components/reader/readerStore'
import type { ReaderDoc } from '@/lib/reader'

const cache = new Map<string, ReaderDoc>()

function LiveDiagram({ slug }: { slug: string }) {
  const diagram = getCaseDiagram(slug)
  const [step, setStep] = useState(0)
  useEffect(() => {
    if (!diagram) return
    const id = setInterval(() => setStep((s) => (s + 1) % diagram.steps.length), 2600)
    return () => clearInterval(id)
  }, [diagram])
  if (!diagram) return null
  const s = diagram.steps[step]
  return (
    <figure className="reader-diagram my-8 rounded-2xl border border-[#1b1d24]/10 bg-white/60 p-4 md:p-6">
      <SystemDiagram diagram={diagram} active={s.highlight} />
      <figcaption className="mt-3 min-h-[3.2em] text-[0.95rem] leading-snug text-[#2b2e38]">
        <b className="text-[#1b1d24]">{s.title}.</b> {s.body}
      </figcaption>
    </figure>
  )
}

export default function Reader() {
  const target = useReaderTarget()
  const [doc, setDoc] = useState<ReaderDoc | null>(null)
  const [failed, setFailed] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!target) return
    const key = `${target.kind}:${target.id}`
    setFailed(false)
    const hit = cache.get(key)
    setDoc(hit ?? null)
    scroller.current?.scrollTo(0, 0)
    if (hit) return
    let live = true
    fetch(`/api/read/${target.kind}/${target.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: ReaderDoc) => {
        cache.set(key, d)
        if (live) setDoc(d)
      })
      .catch(() => live && setFailed(true))
    return () => {
      live = false
    }
  }, [target])

  useEffect(() => {
    if (!target) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        closeReader()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [target])

  const href = target ? (target.kind === 'case' ? `/work/${target.id}` : `/writing/${target.id}`) : '#'

  return (
    <AnimatePresence>
      {target && (
        <motion.div
          key="reader"
          className="fixed inset-0 z-[300] flex items-end justify-center md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          role="dialog"
          aria-modal="true"
          aria-label={doc?.title ?? 'Reading'}
        >
          <div className="absolute inset-0 bg-[#0d0f18]/55 backdrop-blur-[3px]" onClick={closeReader} />
          <motion.div
            className="relative flex h-[92dvh] w-full max-w-[46rem] flex-col overflow-hidden rounded-t-[1.6rem] bg-[#f8f4ee] shadow-[0_30px_80px_rgba(0,0,0,0.45)] md:h-[88dvh] md:rounded-[1.6rem]"
            initial={{ y: 60, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 50, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#1b1d24]/10 px-5 py-3">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[0.85rem] font-semibold text-[#5b5f6d] hover:text-[#1b1d24]"
              >
                Open as a page <ArrowUpRight size={13} weight="bold" />
              </a>
              <button
                type="button"
                onClick={closeReader}
                aria-label="Close"
                className="flex h-9 items-center gap-1.5 rounded-full bg-[#1b1d24] px-3.5 text-[0.85rem] font-semibold text-[#f8f4ee] transition-transform hover:scale-105 active:scale-95"
              >
                <X size={14} weight="bold" /> Back to the world
              </button>
            </div>

            <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <article className="px-6 pb-20 pt-9 md:px-12">
                {!doc && !failed && (
                  <div className="space-y-4" aria-busy="true">
                    <div className="h-4 w-40 animate-pulse rounded bg-[#1b1d24]/10" />
                    <div className="h-10 w-4/5 animate-pulse rounded bg-[#1b1d24]/10" />
                    <div className="h-4 w-full animate-pulse rounded bg-[#1b1d24]/10" />
                    <div className="h-4 w-11/12 animate-pulse rounded bg-[#1b1d24]/10" />
                  </div>
                )}
                {failed && (
                  <p className="text-[1.05rem] text-[#2b2e38]">
                    That one did not load. You can still{' '}
                    <a href={href} className="font-semibold underline decoration-[#ff6a3d] decoration-2 underline-offset-4">
                      open it as a page
                    </a>
                    .
                  </p>
                )}
                {doc && (
                  <>
                    <p className="text-[0.92rem] text-[#5b5f6d]">{doc.kicker}</p>
                    <h1 className="display mt-3 text-[clamp(2rem,5.5vw,3rem)] text-[#1b1d24]">{doc.title}</h1>
                    {doc.summary && <p className="mt-5 text-[1.15rem] leading-relaxed text-[#2b2e38]">{doc.summary}</p>}
                    {doc.stats && (
                      <dl className="mt-7 grid grid-cols-3 gap-3 border-y border-[#1b1d24]/10 py-5">
                        {doc.stats.map((s) => (
                          <div key={s.label}>
                            <dt className="sr-only">{s.label}</dt>
                            <dd>
                              <span className="display-tight block text-[1.7rem] text-[#1b1d24]">{s.value}</span>
                              <span className="mt-1 block text-[0.85rem] leading-snug text-[#5b5f6d]">{s.label}</span>
                            </dd>
                          </div>
                        ))}
                      </dl>
                    )}
                    {doc.kind === 'case' && <LiveDiagram slug={doc.id} />}
                    <div className="reader-prose" dangerouslySetInnerHTML={{ __html: doc.html }} />
                    {doc.source && (
                      <a
                        href={doc.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-12 inline-flex items-center gap-1 font-semibold text-[#1b1d24] underline decoration-[#ff6a3d] decoration-2 underline-offset-4"
                      >
                        Originally on Medium <ArrowUpRight size={14} weight="bold" />
                      </a>
                    )}
                  </>
                )}
              </article>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
