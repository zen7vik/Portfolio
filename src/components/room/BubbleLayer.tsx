'use client'

import { openReader } from '@/components/reader/readerStore'
import { useRoom } from '@/components/room/store'

/** Elements the in-canvas projector moves every frame, keyed by bubble id. */
export const bubbleEls = new Map<string, HTMLDivElement>()

export default function BubbleLayer() {
  const bubbles = useRoom((s) => s.bubbles)
  return (
    <div className="pointer-events-none absolute inset-0 z-[90] overflow-hidden">
      {bubbles.map((b) => (
        <div
          key={b.id}
          ref={(el) => {
            if (el) bubbleEls.set(b.id, el)
            else bubbleEls.delete(b.id)
          }}
          className="absolute left-0 top-0"
          style={{ visibility: 'hidden' }}
        >
          <div className="-translate-x-1/2 -translate-y-full pb-2">
            <div className="relative w-max max-w-[min(17rem,64vw)] origin-bottom animate-[bubble-pop_0.42s_cubic-bezier(0.2,1.5,0.4,1)] rounded-2xl bg-[#f8f4ee] px-4 py-3 text-[14px] font-medium leading-snug text-[#1b1d24] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
              {b.text}
              {b.link && (
                <a
                  href={b.link.href}
                  target={b.link.external ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!b.link?.read) return
                    e.preventDefault()
                    openReader(b.link.read.kind, b.link.read.id)
                  }}
                  className="pointer-events-auto mt-2 block font-semibold text-[#c23a12] underline decoration-2 underline-offset-4"
                >
                  {b.link.label}
                </a>
              )}
              <span className="absolute -bottom-1.5 left-1/2 size-3 -translate-x-1/2 rotate-45 bg-[#f8f4ee]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
