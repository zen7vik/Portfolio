'use client'

import { useEffect, useRef } from 'react'
import { useRoom } from '@/components/room/store'

const LABELS: Record<string, string> = {
  avatar: 'Me, on call',
  monitor: 'My computer',
  cat: 'Kafka the cat',
  lamp: 'Desk lamp',
  chai: 'Chai',
  pager: 'The pager',
  laptop: 'InvestIQ',
  book: 'A blog post',
  note: 'A skill',
  clock: 'Your time',
  rack: 'Home server',
  gopher: 'Go plush',
  auto: 'Ride around Delhi',
  plant: 'A brave plant',
  window: 'Day or night?',
  mochi: 'Mochi the puppy',
  heimdall: 'Heimdall, my AI bot',
  kudos: 'Kind words',
}

export default function HoverLabel() {
  const hovered = useRoom((s) => s.hovered)
  const focus = useRoom((s) => s.focus)
  const found = useRoom((s) => s.found)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (ref.current) ref.current.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 14}px)`
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  const label = hovered ? LABELS[hovered] : null
  const fresh = hovered && !found.includes(hovered)
  return (
    <div ref={ref} className="pointer-events-none fixed left-0 top-0 z-[110] hidden md:block">
      <div
        className={`flex items-center gap-1.5 rounded-full bg-[#1b1d24] px-3 py-1.5 text-[0.8rem] font-semibold text-[#f3ece2] shadow-lg transition-[opacity,transform] duration-200 ${
          label && focus === 'room' ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
        }`}
      >
        {fresh && <span className="size-1.5 rounded-full bg-[#ff6a3d]" />}
        {label}
      </div>
    </div>
  )
}
