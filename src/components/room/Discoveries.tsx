'use client'

import { useEffect, useRef, useState } from 'react'
import { blip } from '@/components/room/sound'
import { FINDABLE, say, useRoom } from '@/components/room/store'

const CONFETTI = ['#ff6a3d', '#ffd43b', '#2f9e44', '#74c0fc', '#f3ece2', '#e5dbff']

export default function Discoveries({ hidden }: { hidden: boolean }) {
  const found = useRoom((s) => s.found)
  const total = FINDABLE.length
  const [pop, setPop] = useState(false)
  const [party, setParty] = useState(false)
  const prev = useRef(0)

  useEffect(() => {
    if (found.length > prev.current) {
      setPop(true)
      const t = setTimeout(() => setPop(false), 380)
      if (found.length === total) {
        setParty(true)
        ;[523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, 0.16, 'triangle', 0.07), i * 110))
        setTimeout(() => say('avatar', 'You found everything in my room. You would be great at debugging. Want to work together?', 7000, { label: 'Email me', href: 'mailto:satvik19nitm@gmail.com' }), 600)
        setTimeout(() => setParty(false), 4200)
      }
      prev.current = found.length
      return () => clearTimeout(t)
    }
  }, [found.length, total])

  return (
    <>
      <div
        className={`pointer-events-none absolute bottom-4 left-4 transition-opacity duration-500 md:bottom-6 md:left-7 ${hidden ? 'opacity-0' : 'opacity-100'}`}
      >
        <div
          className={`rounded-2xl bg-[#f8f4ee] px-4 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-transform duration-300 ${pop ? 'scale-110 -rotate-2' : 'scale-100 rotate-0'}`}
        >
          <p className="text-[0.82rem] font-semibold text-[#1b1d24]">
            Found {found.length} of {total} things
          </p>
          <div className="mt-2 flex gap-1">
            {FINDABLE.map((f) => (
              <span
                key={f}
                className={`h-1.5 w-3 rounded-full transition-colors duration-300 ${found.includes(f) ? 'bg-[#ff6a3d]' : 'bg-[#1b1d24]/15'}`}
              />
            ))}
          </div>
        </div>
      </div>
      {party && (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-[120] overflow-hidden">
          {Array.from({ length: 90 }, (_, i) => (
            <span
              key={i}
              className="absolute top-[-5%] block h-3 w-2 rounded-[2px]"
              style={{
                left: `${(i * 37) % 100}%`,
                background: CONFETTI[i % CONFETTI.length],
                animation: `confetti ${2.2 + ((i * 13) % 10) / 6}s cubic-bezier(0.3,0.6,0.5,1) ${((i * 7) % 12) / 20}s forwards`,
                transform: `rotate(${(i * 47) % 360}deg)`,
              }}
            />
          ))}
        </div>
      )}
    </>
  )
}
