'use client'

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SystemDiagram from '@/components/case/SystemDiagram'
import { getCaseDiagram } from '@/components/case/registry'
import { prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Scrolly({ case: slug, accent = '#7c8cff' }: { case: string; accent?: string }) {
  const diagram = getCaseDiagram(slug)
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)
  const reduced = typeof window !== 'undefined' && prefersReducedMotion()

  useGSAP(
    () => {
      if (!diagram || reduced || !containerRef.current) return
      const steps = gsap.utils.toArray<HTMLElement>('.scrolly-step', containerRef.current)
      for (const [i, el] of steps.entries()) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (self.isActive) setActiveStep(i)
          },
        })
      }
    },
    { scope: containerRef, dependencies: [slug] },
  )

  if (!diagram) return null

  const active = reduced
    ? diagram.steps.flatMap((s) => s.highlight)
    : (diagram.steps[activeStep]?.highlight ?? [])

  return (
    <div ref={containerRef} className="my-16 lg:grid lg:grid-cols-2 lg:gap-12">
      {/* mobile: diagram inline first; desktop: sticky right column */}
      <div className="order-2 hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-fg/10 bg-bg/70 p-6 backdrop-blur-sm">
          <SystemDiagram diagram={diagram} active={active} accent={accent} />
        </div>
      </div>
      <div className="sticky top-16 z-10 order-1 lg:hidden">
        <div className="rounded-2xl border border-fg/10 bg-bg/90 p-3 backdrop-blur-md">
          <SystemDiagram diagram={diagram} active={active} accent={accent} />
        </div>
      </div>
      <div className="order-1 mt-10 lg:mt-0">
        {diagram.steps.map((step, i) => (
          <div
            key={step.id}
            className="scrolly-step flex min-h-[45vh] flex-col justify-center py-8 lg:min-h-[60vh]"
            style={{ opacity: reduced || i === activeStep ? 1 : 0.35, transition: 'opacity 0.4s' }}
          >
            <span className="font-mono text-xs" style={{ color: accent }}>
              {String(i + 1).padStart(2, '0')} / {String(diagram.steps.length).padStart(2, '0')}
            </span>
            <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">{step.title}</h3>
            <p className="mt-4 max-w-md leading-relaxed text-muted">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
