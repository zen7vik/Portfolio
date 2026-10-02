'use client'

import { useRef, useState } from 'react'
import { controls, getState, setState } from '@/components/ride/store'

export default function Joystick() {
  const base = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const pointer = useRef<number | null>(null)

  const move = (clientX: number, clientY: number) => {
    const r = base.current!.getBoundingClientRect()
    const max = r.width / 2 - 18
    let dx = clientX - (r.left + r.width / 2)
    let dy = clientY - (r.top + r.height / 2)
    const len = Math.hypot(dx, dy)
    if (len > max) {
      dx = (dx / len) * max
      dy = (dy / len) * max
    }
    setKnob({ x: dx, y: dy })
    const fy = -dy / max
    const fx = -dx / max
    controls.forward = Math.abs(fy) < 0.18 ? 0 : fy
    controls.steer = Math.abs(fx) < 0.15 ? 0 : fx
    if (!getState().started) setState({ started: true })
  }

  const end = () => {
    pointer.current = null
    setKnob({ x: 0, y: 0 })
    controls.forward = 0
    controls.steer = 0
  }

  return (
    <div className="ride-touch">
      <div
        ref={base}
        className="ride-stick"
        onPointerDown={(e) => {
          pointer.current = e.pointerId
          e.currentTarget.setPointerCapture(e.pointerId)
          move(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => pointer.current === e.pointerId && move(e.clientX, e.clientY)}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <div className="ride-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
      </div>
      <div className="ride-touch-buttons">
        <button
          type="button"
          onPointerDown={() => (controls.brake = true)}
          onPointerUp={() => (controls.brake = false)}
          onPointerCancel={() => (controls.brake = false)}
        >
          Drift
        </button>
        <button type="button" onPointerDown={() => (controls.honk = true)}>
          Honk
        </button>
      </div>
    </div>
  )
}
