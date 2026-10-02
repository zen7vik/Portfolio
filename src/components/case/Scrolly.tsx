'use client'

import { useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import SystemDiagram from '@/components/case/SystemDiagram'
import { getCaseDiagram } from '@/components/case/registry'
import { prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export default function Scrolly({ case: slug }: { case: string }) {
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
    <div ref={containerRef} className="my-16 lg:grid lg:grid-cols-12 lg:gap-14">
      {/* mobile: diagram pinned under the nav; desktop: sticky right column */}
      <div className="order-2 hidden lg:col-span-7 lg:block">
        <div className="sticky top-28 rounded-2xl border border-line bg-raised/60 p-6">
          <SystemDiagram diagram={diagram} active={active} />
        </div>
      </div>
      <div className="sticky top-[4.25rem] z-10 order-1 lg:hidden">
        <div className="rounded-2xl border border-line bg-bg/95 p-3 backdrop-blur-md">
          <SystemDiagram diagram={diagram} active={active} />
        </div>
      </div>
      <div className="order-1 mt-10 lg:col-span-5 lg:mt-0">
        {diagram.steps.map((step, i) => (
          <div
            key={step.id}
            className="scrolly-step flex min-h-[45vh] flex-col justify-center py-8 lg:min-h-[60vh]"
            style={{ opacity: reduced || i === activeStep ? 1 : 0.35, transition: 'opacity 0.4s' }}
          >
            <h3 className="display-tight text-[1.6rem] text-fg">{step.title}</h3>
            <p className="mt-4 max-w-md text-[1.05rem] leading-relaxed text-fg-2">{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
