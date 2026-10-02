'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowCounterClockwise, Lightning, Pause, Play } from '@phosphor-icons/react'
import { BOOT_MS, createSim, type Sim, type SimNode, type Stats } from '@/components/play/sim'
import { prefersReducedMotion } from '@/lib/motion'

type Colors = {
  fg: string
  muted: string
  line: string
  bg: string
  raised: string
  accent: string
  bad: string
  ok: string
  mono: string
}

function readColors(el: HTMLElement): Colors {
  const s = getComputedStyle(el)
  const v = (k: string) => s.getPropertyValue(k).trim()
  return {
    fg: v('--fg'),
    muted: v('--muted'),
    line: v('--line'),
    bg: v('--bg'),
    raised: v('--bg-raised'),
    accent: v('--accent'),
    bad: v('--bad'),
    ok: v('--ok'),
    mono: v('--font-mono') || 'monospace',
  }
}

const BASE_RATE = 9
const SPIKE_RATE = 26

export default function Playground() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const simRef = useRef<Sim | null>(null)
  const hoverRef = useRef<string | null>(null)
  const optsRef = useRef({ selfHeal: true, spikeUntil: 0, running: true })
  const [stats, setStats] = useState<Stats>({ served: 0, dropped: 0, retried: 0 })
  const [selfHeal, setSelfHeal] = useState(true)
  const [running, setRunning] = useState(true)
  const [spiking, setSpiking] = useState(false)
  const [downCount, setDownCount] = useState(0)

  if (!simRef.current) simRef.current = createSim()

  useEffect(() => {
    if (prefersReducedMotion()) {
      optsRef.current.running = false
      setRunning(false)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const sim = simRef.current!

    let w = 0
    let h = 0
    let dpr = 1
    let colors = readColors(wrap)
    let visible = true
    let raf = 0
    let last = performance.now()
    let simNow = 0
    let frame = 0

    const resize = () => {
      const r = wrap.getBoundingClientRect()
      dpr = Math.min(2, window.devicePixelRatio || 1)
      w = r.width
      h = r.height
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 })
    io.observe(wrap)

    const themeObs = new MutationObserver(() => (colors = readColors(wrap)))
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    const padX = () => Math.max(46, w * 0.02)
    const px = (n: { x: number }) => padX() + n.x * (w - padX() * 2)
    const py = (n: { y: number }) => 34 + n.y * (h - 68)
    const scale = () => Math.min(1, w / 520)

    const nodeBox = () => {
      const s = scale()
      return { bw: 84 * s + 14, bh: 28 * s + 8 }
    }

    const draw = () => {
      const s = scale()
      const { bw, bh } = nodeBox()
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      // edges
      for (const [a, b] of sim.edges) {
        const dead = a.state !== 'up' || b.state !== 'up'
        ctx.beginPath()
        ctx.moveTo(px(a), py(a))
        const mx = (px(a) + px(b)) / 2
        ctx.bezierCurveTo(mx, py(a), mx, py(b), px(b), py(b))
        ctx.strokeStyle = dead ? colors.bad : colors.fg
        ctx.lineWidth = 1
        ctx.setLineDash(dead ? [3, 5] : [])
        ctx.globalAlpha = dead ? 0.35 : 0.16
        ctx.stroke()
        ctx.globalAlpha = 1
      }
      ctx.setLineDash([])

      // packets along the same curves
      for (const p of sim.packets) {
        if (p.done) continue
        const a = p.from
        const b = p.to
        let x: number
        let y: number
        if (p.waiting > 0) {
          const jitter = Math.sin((simNow + p.id * 97) / 90) * 4
          x = px(a) + bw / 2 + 6 + (p.id % 3) * 4
          y = py(a) + jitter
        } else {
          const t = easeInOut(Math.min(1, p.t))
          const x0 = px(a)
          const y0 = py(a)
          const x3 = px(b)
          const y3 = py(b)
          const mx = (x0 + x3) / 2
          x = bez(x0, mx, mx, x3, t)
          y = bez(y0, y0, y3, y3, t)
        }
        const rad = 3.1 * Math.max(0.8, s)
        if (p.waiting === 0 && !p.retried) {
          // short comet tail along the curve
          for (let k = 1; k <= 4; k++) {
            const tt = easeInOut(Math.max(0, Math.min(1, p.t) - k * 0.035))
            const x0 = px(a)
            const x3 = px(b)
            const mx = (x0 + x3) / 2
            ctx.beginPath()
            ctx.arc(bez(x0, mx, mx, x3, tt), bez(py(a), py(a), py(b), py(b), tt), rad * (1 - k * 0.18), 0, Math.PI * 2)
            ctx.globalAlpha = 0.28 - k * 0.06
            ctx.fillStyle = colors.accent
            ctx.fill()
          }
          ctx.globalAlpha = 1
        }
        ctx.beginPath()
        ctx.arc(x, y, rad, 0, Math.PI * 2)
        if (p.retried) {
          ctx.strokeStyle = colors.accent
          ctx.lineWidth = 1.5
          ctx.stroke()
        } else if (p.waiting > 0) {
          ctx.fillStyle = colors.muted
          ctx.fill()
        } else {
          ctx.fillStyle = colors.accent
          ctx.fill()
        }
      }

      // nodes
      ctx.font = `500 ${Math.round(11 * Math.max(0.85, s))}px ${colors.mono}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      for (const n of sim.nodes) {
        const x = px(n)
        const y = py(n)
        const hovered = hoverRef.current === n.id
        const r = 7
        ctx.beginPath()
        roundRect(ctx, x - bw / 2, y - bh / 2, bw, bh, r)
        ctx.fillStyle = colors.bg
        ctx.fill()
        if (n.state === 'down') {
          ctx.globalAlpha = 0.12
          ctx.fillStyle = colors.bad
          ctx.fill()
          ctx.globalAlpha = 1
        }
        ctx.lineWidth = hovered || n.state !== 'up' ? 1.5 : 1
        const idle = n.state === 'up' && !hovered
        ctx.strokeStyle = n.state === 'down' ? colors.bad : idle ? colors.fg : colors.accent
        ctx.globalAlpha = idle ? 0.24 : 1
        ctx.stroke()
        ctx.globalAlpha = 1

        if (n.state === 'booting') {
          const prog = Math.min(1, (simNow - n.since) / BOOT_MS)
          ctx.beginPath()
          ctx.moveTo(x - bw / 2 + r, y + bh / 2)
          ctx.lineTo(x - bw / 2 + r + (bw - r * 2) * prog, y + bh / 2)
          ctx.strokeStyle = colors.accent
          ctx.lineWidth = 2
          ctx.stroke()
        }

        ctx.fillStyle = n.state === 'down' ? colors.bad : n.killable ? colors.fg : colors.muted
        const label = n.state === 'down' ? 'down' : n.state === 'booting' ? 'restarting' : n.label
        ctx.fillText(label, x, y + 0.5)
      }

      // bursts
      for (const b of sim.bursts) {
        const age = (simNow - b.t) / 900
        if (age < 0 || age > 1) continue
        const x = px(b)
        const y = py(b)
        ctx.beginPath()
        ctx.arc(x, y, 10 + age * (b.kind === 'kill' ? 70 : 26), 0, Math.PI * 2)
        ctx.strokeStyle = b.kind === 'ok' ? colors.ok : b.kind === 'drop' ? colors.bad : colors.bad
        ctx.globalAlpha = (1 - age) * (b.kind === 'ok' ? 0.5 : 0.8)
        ctx.lineWidth = 1.5
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    }

    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(50, t - last)
      last = t
      if (!visible || document.hidden) return
      const o = optsRef.current
      if (o.running) {
        simNow += dt
        const spike = simNow < o.spikeUntil
        sim.step(simNow, dt, { rate: spike ? SPIKE_RATE : BASE_RATE, selfHeal: o.selfHeal })
      }
      draw()
      if (++frame % 12 === 0) {
        setStats({ ...sim.stats })
        setDownCount(sim.nodes.filter((n) => n.state !== 'up').length)
        setSpiking(simNow < o.spikeUntil)
      }
    }
    raf = requestAnimationFrame(loop)

    const hit = (e: PointerEvent): SimNode | null => {
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      const { bw, bh } = nodeBox()
      return sim.nodes.find((n) => Math.abs(x - px(n)) < bw / 2 + 6 && Math.abs(y - py(n)) < bh / 2 + 8) ?? null
    }
    const onMove = (e: PointerEvent) => {
      const n = hit(e)
      hoverRef.current = n?.killable ? n.id : null
      canvas.style.cursor = n?.killable ? 'pointer' : 'default'
    }
    const onDown = (e: PointerEvent) => {
      const n = hit(e)
      if (n?.killable) sim.kill(n.id, simNow)
    }
    const onLeave = () => (hoverRef.current = null)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerleave', onLeave)

    // expose the sim clock to the spike button
    ;(wrap as HTMLElement & { simNow?: () => number }).simNow = () => simNow

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      themeObs.disconnect()
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  const now = () => (wrapRef.current as (HTMLElement & { simNow?: () => number }) | null)?.simNow?.() ?? 0
  const total = stats.served + stats.dropped
  const availability = total ? (stats.served / total) * 100 : 100

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-raised/60">
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <p className="text-[0.95rem] font-semibold leading-tight text-fg">Try to take it down</p>
          <p className="mt-1 text-sm leading-snug text-muted">
            {selfHeal
              ? 'Click any node to kill it. Traffic retries around it and the node heals itself.'
              : 'Healing is off. Dead nodes stay down until you click them again.'}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={`tabular font-mono text-2xl font-medium leading-none ${availability < 99 ? 'text-bad' : 'text-fg'}`}
          >
            {availability.toFixed(availability === 100 ? 0 : 2)}%
          </p>
          <p className="meta mt-1.5 text-muted">served</p>
        </div>
      </div>

      <div ref={wrapRef} className="relative min-h-[260px] flex-1 touch-manipulation">
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          role="img"
          aria-label="Interactive simulation of requests flowing from users through two gateways, three workers and two databases. Clicking a node takes it down."
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-line px-5 py-3.5">
        <dl className="meta tabular flex gap-5 text-muted">
          <div className="flex gap-1.5">
            <dt>ok</dt>
            <dd className="text-fg">{stats.served.toLocaleString()}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>retried</dt>
            <dd className="text-fg">{stats.retried.toLocaleString()}</dd>
          </div>
          <div className="flex gap-1.5">
            <dt>dropped</dt>
            <dd className={stats.dropped ? 'text-bad' : 'text-fg'}>{stats.dropped.toLocaleString()}</dd>
          </div>
        </dl>
        <div className="flex items-center gap-1.5">
          <CtrlButton
            label={spiking ? 'Spiking' : 'Spike'}
            active={spiking}
            onClick={() => {
              optsRef.current.spikeUntil = now() + 4000
              setSpiking(true)
            }}
          >
            <Lightning size={14} weight="bold" />
          </CtrlButton>
          <CtrlButton
            label={selfHeal ? 'Healing on' : 'Healing off'}
            active={!selfHeal}
            onClick={() => {
              optsRef.current.selfHeal = !selfHeal
              setSelfHeal(!selfHeal)
            }}
          />
          <CtrlButton
            label={running ? 'Pause' : 'Play'}
            iconOnly
            onClick={() => {
              optsRef.current.running = !running
              setRunning(!running)
            }}
          >
            {running ? <Pause size={15} weight="bold" /> : <Play size={15} weight="bold" />}
          </CtrlButton>
          <CtrlButton
            label="Reset"
            iconOnly
            onClick={() => {
              simRef.current?.reset()
              setStats({ served: 0, dropped: 0, retried: 0 })
            }}
          >
            <ArrowCounterClockwise size={15} weight="bold" />
          </CtrlButton>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {downCount ? `${downCount} nodes down` : ''}
      </p>
      <div className="sr-only">
        {simRef.current.nodes
          .filter((n) => n.killable)
          .map((n) => (
            <button key={n.id} onClick={() => simRef.current?.kill(n.id, now())}>
              Toggle {n.label}
            </button>
          ))}
      </div>
    </div>
  )
}

function CtrlButton({
  label,
  onClick,
  children,
  active,
  iconOnly,
}: {
  label: string
  onClick: () => void
  children?: React.ReactNode
  active?: boolean
  iconOnly?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 font-mono text-xs transition-[background-color,color,border-color,transform] duration-200 active:scale-[0.96] ${
        active ? 'border-accent bg-accent text-on-accent' : 'border-line text-fg-2 hover:border-fg/30 hover:text-fg'
      } ${iconOnly ? 'w-8 justify-center px-0' : ''}`}
    >
      {children}
      {!iconOnly && <span>{label}</span>}
    </button>
  )
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
}

function bez(a: number, b: number, c: number, d: number, t: number) {
  const u = 1 - t
  return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}
