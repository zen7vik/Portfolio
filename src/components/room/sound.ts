'use client'

import { getState } from '@/components/room/store'

let ctx: AudioContext | null = null

function audio() {
  if (!getState().sound) return null
  ctx ??= new AudioContext()
  return ctx
}

/** Tiny synthesized blip with a little pitch randomness so repeats feel less robotic. */
export function blip(freq = 520, dur = 0.09, type: OscillatorType = 'sine', gain = 0.08) {
  const a = audio()
  if (!a) return
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.value = freq * (0.94 + Math.random() * 0.12)
  o.frequency.exponentialRampToValueAtTime(o.frequency.value * 1.4, a.currentTime + dur)
  g.gain.setValueAtTime(gain, a.currentTime)
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur)
  o.connect(g).connect(a.destination)
  o.start()
  o.stop(a.currentTime + dur)
}

export function buzz() {
  for (let i = 0; i < 3; i++) setTimeout(() => blip(140, 0.12, 'square', 0.03), i * 160)
}

export function meow() {
  const a = audio()
  if (!a) return
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = 'triangle'
  const t = a.currentTime
  o.frequency.setValueAtTime(620, t)
  o.frequency.linearRampToValueAtTime(900, t + 0.12)
  o.frequency.linearRampToValueAtTime(520, t + 0.38)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(0.07, t + 0.05)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42)
  o.connect(g).connect(a.destination)
  o.start()
  o.stop(t + 0.45)
}
