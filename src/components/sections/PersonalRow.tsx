'use client'

import { useState } from 'react'
import { restoreSceneBase, setScene } from '@/components/scene/sceneStore'
import type { MiscItem } from '@/content/misc'

export default function PersonalRow({ item }: { item: MiscItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="group"
      onMouseEnter={() => setScene({ intensity: 1.25, accent: '#f0b35e' })}
      onMouseLeave={() => restoreSceneBase()}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full flex-col gap-2 rounded-lg px-2 py-6 text-left transition-colors group-hover:bg-fg/5 md:flex-row md:items-baseline md:gap-8"
      >
        <span className="flex w-56 shrink-0 items-baseline gap-3">
          <span
            className={`inline-block font-mono text-xs text-amber transition-transform duration-300 ${open ? 'rotate-90' : ''}`}
          >
            ›
          </span>
          <span className="font-display text-lg font-semibold transition-colors group-hover:text-amber">
            {item.title}
          </span>
        </span>
        <span className="flex-1 text-muted">{item.blurb}</span>
        <span className="shrink-0 font-mono text-xs text-muted/70">{item.tags.join(' · ')}</span>
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-500 ease-out"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-2 pb-7 pl-[4.25rem] md:pr-40">
            <p className="max-w-2xl leading-relaxed text-muted">{item.detail}</p>
            {item.link && (
              <a
                href={item.link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block font-mono text-xs text-amber underline-offset-4 hover:underline"
              >
                {item.link.label} →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
