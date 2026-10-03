'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useProgress } from '@react-three/drei'
import Reader from '@/components/reader/Reader'
import { isReaderOpen } from '@/components/reader/readerStore'
import Joystick from '@/components/ride/Joystick'
import Panel from '@/components/ride/Panel'
import Wayfinder from '@/components/ride/Wayfinder'
import { CHAI_TOTAL, controls, initTime, keys, setState, syncKeys, useRide, type TimeOfDay } from '@/components/ride/store'
import { sfx } from '@/components/ride/sound'
import type { RideData } from '@/components/ride/types'
import '@/components/ride/ride.css'

const Scene = dynamic(() => import('@/components/ride/Scene'), { ssr: false })

const NEXT_TIME: Record<TimeOfDay, TimeOfDay> = { day: 'dusk', dusk: 'night', night: 'day' }
const TIME_LABEL: Record<TimeOfDay, string> = { day: 'Day', dusk: 'Dusk', night: 'Night' }

function Loader() {
  const ready = useRide((s) => s.ready)
  const { progress } = useProgress()
  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setGone(true), 700)
    return () => clearTimeout(t)
  }, [ready])
  if (gone) return null
  return (
    <div className={`ride-loader ${ready ? 'is-done' : ''}`}>
      <p className="ride-loader-horn display">
        Pom <span>pom.</span>
      </p>
      <p className="ride-loader-sub">Starting the auto. Hold on to the handle.</p>
      <div className="ride-loader-bar">
        <span style={{ transform: `scaleX(${ready ? 1 : Math.max(0.08, progress / 100) * 0.9})` }} />
      </div>
    </div>
  )
}

function Hud() {
  const chai = useRide((s) => s.chai.length)
  const sound = useRide((s) => s.sound)
  const time = useRide((s) => s.time)
  const started = useRide((s) => s.started)
  const toast = useRide((s) => s.toast)
  const celebrate = useRide((s) => s.celebrate)
  const [showWin, setShowWin] = useState(false)

  useEffect(() => {
    if (!celebrate) return
    setShowWin(true)
    const t = setTimeout(() => setShowWin(false), 7000)
    return () => clearTimeout(t)
  }, [celebrate])

  const confetti = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        dur: 2.2 + Math.random() * 1.6,
        color: ['#ff6a3d', '#ffd43b', '#2f9e44', '#2f6f73', '#c8643b', '#4dabf7'][i % 6],
        rot: Math.random() * 360,
      })),
    [],
  )

  return (
    <>
      <div className="ride-hud-left">
        <span className="ride-sticker ride-title">Satvik&apos;s Delhi</span>
        <span className={`ride-sticker ride-chai ${chai ? 'has' : ''}`} key={chai}>
          chai {chai}/{CHAI_TOTAL}
        </span>
      </div>
      <nav className="ride-hud-right" aria-label="Ride controls">
        <button type="button" className="ride-sticker" onClick={() => setState({ time: NEXT_TIME[time] })}>
          {TIME_LABEL[time]}
        </button>
        <button
          type="button"
          className="ride-sticker"
          aria-pressed={sound}
          onClick={() => {
            setState({ sound: !sound })
            if (!sound) setTimeout(() => sfx.honk(), 30)
          }}
        >
          Sound {sound ? 'on' : 'off'}
        </button>
        <Link href="/" className="ride-sticker">
          <span className="ride-long">Back to the</span> desk
        </Link>
        <Link href="/read" className="ride-sticker ride-sticker-ink">
          <span className="ride-long">Skip to</span> read
        </Link>
      </nav>

      <div className={`ride-hint ${started ? 'is-hidden' : ''}`}>
        <span>
          <kbd>W</kbd>
          <kbd>A</kbd>
          <kbd>S</kbd>
          <kbd>D</kbd> drive
        </span>
        <span>
          <kbd>Space</kbd> drift
        </span>
        <span>
          <kbd>H</kbd> honk
        </span>
        <span>
          <kbd>R</kbd> reset
        </span>
        <span>
          <kbd>Drag</kbd> look around
        </span>
        <span className="ride-hint-goal">Drive into the glowing rings. Crash into anything else.</span>
      </div>

      {toast && (
        <div key={toast.id} className="ride-toast" role="status">
          {toast.text}
        </div>
      )}

      {showWin && (
        <div className="ride-win" role="status">
          <div className="ride-confetti" aria-hidden>
            {confetti.map((c, i) => (
              <i
                key={i}
                style={{
                  left: `${c.left}%`,
                  background: c.color,
                  animationDelay: `${c.delay}s`,
                  animationDuration: `${c.dur}s`,
                  transform: `rotate(${c.rot}deg)`,
                }}
              />
            ))}
          </div>
          <div className="ride-win-card">
            <p className="display">Six chais.</p>
            <p>That is about one on-call night. Your auto has earned underglow. Go show the cow.</p>
          </div>
        </div>
      )}
    </>
  )
}

export default function RideClient({ data }: { data: RideData }) {
  const [mobile, setMobile] = useState(false)
  const [touch, setTouch] = useState(false)

  useEffect(() => {
    initTime()
    const measure = () => {
      setMobile(window.innerWidth < 760)
      setTouch(window.matchMedia('(pointer: coarse)').matches)
    }
    measure()
    window.addEventListener('resize', measure)
    const html = document.documentElement
    const prev = html.style.overflow
    html.style.overflow = 'hidden'

    const map: Record<string, keyof typeof keys> = {
      KeyW: 'up',
      ArrowUp: 'up',
      KeyS: 'down',
      ArrowDown: 'down',
      KeyA: 'left',
      ArrowLeft: 'left',
      KeyD: 'right',
      ArrowRight: 'right',
    }
    const typing = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      return t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable
    }
    const down = (e: KeyboardEvent) => {
      if (typing(e) || e.metaKey || e.ctrlKey || isReaderOpen()) return
      const k = map[e.code]
      if (k) {
        keys[k] = true
        syncKeys()
        e.preventDefault()
      } else if (e.code === 'Space') {
        controls.brake = true
        e.preventDefault()
      } else if (e.code === 'KeyR') controls.reset = true
      else if (e.code === 'KeyH') controls.honk = true
      else if (e.code === 'Escape') setState({ active: null })
    }
    const up = (e: KeyboardEvent) => {
      const k = map[e.code]
      if (k) {
        keys[k] = false
        syncKeys()
      } else if (e.code === 'Space') controls.brake = false
    }
    const blur = () => {
      Object.keys(keys).forEach((k) => (keys[k as keyof typeof keys] = false))
      syncKeys()
      controls.brake = false
    }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', blur)
    return () => {
      html.style.overflow = prev
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', blur)
      window.removeEventListener('resize', measure)
      setState({ active: null, started: false, chai: [], celebrate: false, farmDown: false, visited: [] })
    }
  }, [])

  return (
    <main className="ride-root">
      <h1 className="sr-only">Satvik&apos;s Delhi: drive an auto-rickshaw around a tiny island of my work</h1>
      <Scene mobile={mobile} />
      <Hud />
      <Wayfinder />
      <Panel data={data} />
      {touch && <Joystick />}
      <Reader />
      <Loader />
    </main>
  )
}
