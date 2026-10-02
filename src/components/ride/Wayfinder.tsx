'use client'

import { useEffect, useRef } from 'react'
import { autoPose, useRide } from '@/components/ride/store'
import { ISLAND_R, LANDMARKS, ROAD_R, polar } from '@/components/ride/world-config'

const SIZE = 132
const R = SIZE / 2 - 6
const k = R / (ISLAND_R + 2)

const SHORT: Record<string, string> = {
  tower: 'Safe Security',
  library: 'Library',
  investiq: 'InvestIQ',
  postbox: 'Post office',
  paisabazaar: 'Paisabazaar',
  nit: 'NIT Meghalaya',
}

/** Minimap plus a "next stop" pointer. Live values are written straight to the DOM, no re-renders. */
export default function Wayfinder() {
  const visited = useRide((s) => s.visited)
  const car = useRef<SVGGElement>(null)
  const arrow = useRef<HTMLSpanElement>(null)
  const nextName = useRef<HTMLSpanElement>(null)
  const nextDist = useRef<HTMLSpanElement>(null)
  const visitedRef = useRef(visited)
  visitedRef.current = visited

  useEffect(() => {
    let raf = 0
    let lastName = ''
    let lastDist = -1
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const x = autoPose.x * k
      const y = autoPose.z * k
      // yaw 0 faces -z (map up); svg rotation is clockwise
      car.current?.setAttribute('transform', `translate(${x} ${y}) rotate(${(-autoPose.yaw * 180) / Math.PI})`)

      const pending = LANDMARKS.filter((l) => !visitedRef.current.includes(l.id))
      const pool = pending.length ? pending : LANDMARKS
      let best = pool[0]
      let bestD = Infinity
      for (const l of pool) {
        const [lx, lz] = polar(l.angle, 27.4)
        const d = Math.hypot(lx - autoPose.x, lz - autoPose.z)
        if (d < bestD) {
          bestD = d
          best = l
        }
      }
      const [bx, bz] = polar(best.angle, 27.4)
      const bearing = Math.atan2(bx - autoPose.x, -(bz - autoPose.z))
      const heading = -autoPose.yaw
      const rel = ((bearing - heading) * 180) / Math.PI
      if (arrow.current) arrow.current.style.transform = `rotate(${rel}deg)`
      const name = pending.length ? SHORT[best.id] : 'All six visited'
      if (name !== lastName && nextName.current) {
        nextName.current.textContent = name
        lastName = name
      }
      const dist = Math.round(bestD)
      if (dist !== lastDist && nextDist.current) {
        nextDist.current.textContent = pending.length ? `${dist} m` : ''
        lastDist = dist
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="ride-way" aria-label="Map">
      <svg width={SIZE} height={SIZE} viewBox={`${-SIZE / 2} ${-SIZE / 2} ${SIZE} ${SIZE}`} role="img" aria-label="Island map with landmarks">
        <circle r={R} fill="#a7c957" stroke="#222" strokeWidth={2.5} />
        <circle r={ROAD_R * k} fill="none" stroke="#4a4e5a" strokeWidth={4} />
        <line x1={0} y1={-2 * k} x2={0} y2={22 * k} stroke="#4a4e5a" strokeWidth={4} />
        {LANDMARKS.map((l) => {
          const [x, z] = polar(l.angle, 31)
          const done = visited.includes(l.id)
          return (
            <g key={l.id} transform={`translate(${x * k} ${z * k})`}>
              <title>{SHORT[l.id]}</title>
              <circle r={7} fill={l.color} stroke="#222" strokeWidth={2} />
              {done && <path d="M-3.2 0.2 L-0.8 2.6 L3.4 -2.4" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />}
            </g>
          )
        })}
        <g ref={car}>
          <path d="M0 -6 L4.5 4.5 L0 2.4 L-4.5 4.5 Z" fill="#ffd43b" stroke="#222" strokeWidth={1.6} strokeLinejoin="round" />
        </g>
      </svg>
      <div className="ride-next">
        <span ref={arrow} className="ride-next-arrow" aria-hidden>
          ↑
        </span>
        <span>
          <small>Next stop</small>
          <span ref={nextName} className="ride-next-name" />
          <span ref={nextDist} className="ride-next-dist" />
        </span>
      </div>
      <p className="ride-visited">{visited.length} of 6 visited</p>
    </div>
  )
}
