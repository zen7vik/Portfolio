'use client'

import { getState } from '@/components/ride/store'

let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  if (!getState().sound) return null
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

function tone(freq: number, start: number, dur: number, type: OscillatorType, gain = 0.12, glideTo?: number) {
  const c = ac()
  if (!c) return
  const t = c.currentTime + start
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, t + dur)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  osc.connect(g).connect(c.destination)
  osc.start(t)
  osc.stop(t + dur + 0.05)
}

export const sfx = {
  honk() {
    // the classic two-note auto horn, with a little random pitch so it never sounds canned
    const p = 1 + (Math.random() - 0.5) * 0.06
    tone(392 * p, 0, 0.16, 'square', 0.07)
    tone(330 * p, 0.2, 0.22, 'square', 0.07)
  },
  chai() {
    const p = 1 + Math.random() * 0.05
    tone(660 * p, 0, 0.12, 'sine', 0.12)
    tone(880 * p, 0.09, 0.12, 'sine', 0.12)
    tone(1320 * p, 0.18, 0.2, 'sine', 0.1)
  },
  thump() {
    tone(110 + Math.random() * 30, 0, 0.18, 'triangle', 0.18, 55)
  },
  moo() {
    tone(180, 0, 0.7, 'sawtooth', 0.05, 120)
  },
  open() {
    tone(520, 0, 0.08, 'sine', 0.08)
    tone(780, 0.06, 0.1, 'sine', 0.07)
  },
  splash() {
    tone(300, 0, 0.5, 'triangle', 0.12, 60)
  },
  arrive() {
    // a bright little arpeggio for the first visit to a landmark
    ;[523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.07, 0.18, 'triangle', 0.08))
  },
}
