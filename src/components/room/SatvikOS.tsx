'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Article,
  Briefcase,
  CarProfile,
  Cpu,
  EnvelopeSimple,
  Flask,
  IdentificationCard,
  TerminalWindow,
  X,
  type Icon,
} from '@phosphor-icons/react'
import { runCommand } from '@/components/terminal/commands'
import { openInWorld } from '@/components/reader/openInWorld'
import { openReader } from '@/components/reader/readerStore'
import { blip } from '@/components/room/sound'
import type { RoomData } from '@/components/room/types'
import { education, roles, stack } from '@/content/experience'
import { site } from '@/lib/site'

type AppId = 'about' | 'work' | 'experience' | 'projects' | 'writing' | 'contact' | 'terminal'
type Win = { id: AppId; x: number; y: number; z: number }

const APPS: { id: AppId | 'ride'; label: string; icon: Icon; color: string }[] = [
  { id: 'about', label: 'about_me.txt', icon: IdentificationCard, color: '#ffd43b' },
  { id: 'work', label: 'Work', icon: Cpu, color: '#ff6a3d' },
  { id: 'experience', label: 'Experience', icon: Briefcase, color: '#74c0fc' },
  { id: 'projects', label: 'Side quests', icon: Flask, color: '#8ce99a' },
  { id: 'writing', label: 'Writing', icon: Article, color: '#e5dbff' },
  { id: 'contact', label: 'Say hi', icon: EnvelopeSimple, color: '#ffc9c9' },
  { id: 'terminal', label: 'Terminal', icon: TerminalWindow, color: '#ced4da' },
  { id: 'ride', label: 'ride.exe', icon: CarProfile, color: '#2f9e44' },
]

const TITLES: Record<AppId, string> = {
  about: 'about_me.txt',
  work: 'Work: systems I own',
  experience: 'Experience',
  projects: 'Side quests',
  writing: 'Writing',
  contact: 'Say hi',
  terminal: 'satvik@desk: ~',
}

export default function SatvikOS({
  data,
  onExit,
  onRide,
  full = false,
}: {
  data: RoomData
  onExit: () => void
  onRide: () => void
  full?: boolean
}) {
  // phones show windows full screen, so start on the desktop where the icons are
  const [wins, setWins] = useState<Win[]>(full ? [] : [{ id: 'about', x: 250, y: 60, z: 1 }])
  const [now, setNow] = useState('')
  const zTop = useRef(2)

  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))
    tick()
    const id = setInterval(tick, 15000)
    return () => clearInterval(id)
  }, [])

  const open = (id: AppId | 'ride') => {
    blip(660)
    if (id === 'ride') return onRide()
    setWins((ws) => {
      const z = ++zTop.current
      const found = ws.find((w) => w.id === id)
      if (found) return ws.map((w) => (w.id === id ? { ...w, z } : w))
      const n = ws.length
      return [...ws, { id, x: 200 + ((n * 46) % 220), y: 40 + ((n * 34) % 140), z }]
    })
  }
  const close = (id: AppId) => setWins((ws) => ws.filter((w) => w.id !== id))
  const focus = (id: AppId) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, z: ++zTop.current } : w)))
  const move = (id: AppId, x: number, y: number) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, x, y } : w)))

  return (
    <div
      className={`relative select-none overflow-hidden font-sans text-[#1b1d24] ${full ? 'h-full w-full' : 'h-[612px] w-[1020px]'}`}
      style={{
        background:
          'radial-gradient(120% 90% at 85% 110%, #ff6a3d 0%, #c8643b 28%, #2f3346 62%, #1d2030 100%)',
      }}
    >
      {/* menu bar */}
      <div className="flex h-8 items-center justify-between bg-[#f3ece2]/90 px-3 text-[13px] font-medium backdrop-blur">
        <div className="flex items-center gap-4">
          <span className="font-bold tracking-tight">SatvikOS</span>
          <span className="text-[#5b5f6d]">v3, compiled with chai</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-[12px] text-[#5b5f6d]">{now}</span>
          <button onClick={onExit} className="rounded-md bg-[#1b1d24] px-2.5 py-0.5 text-[12px] text-[#f3ece2] hover:bg-[#ff6a3d] hover:text-[#1b0b05]">
            Back to the room (Esc)
          </button>
        </div>
      </div>

      {/* wallpaper type */}
      <div className="pointer-events-none absolute bottom-6 right-8 text-right text-[#f3ece2]">
        <p className="display text-[64px] leading-[0.9] opacity-90">
          Satvik
          <br />
          Singh
        </p>
        <p className="mt-2 text-[14px] opacity-80">fullstack AI engineer, Delhi</p>
      </div>

      {/* desktop icons */}
      <div className={`absolute left-4 top-12 grid gap-x-2 gap-y-3 ${full ? 'grid-cols-4' : 'grid-flow-col grid-rows-4'}`}>
        {APPS.map((a) => (
          <button
            key={a.id}
            onDoubleClick={() => open(a.id)}
            onClick={() => open(a.id)}
            className="group flex w-[84px] flex-col items-center gap-1.5 rounded-lg p-1.5 text-center hover:bg-white/10"
          >
            <span
              className="flex size-12 items-center justify-center rounded-xl shadow-[0_6px_14px_rgba(0,0,0,0.35)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:rotate-[-4deg] group-active:scale-90"
              style={{ background: a.color }}
            >
              <a.icon size={26} weight="duotone" color="#1b1d24" />
            </span>
            <span className="text-[12px] font-medium leading-tight text-[#f3ece2] [text-shadow:0_1px_3px_rgba(0,0,0,0.6)]">
              {a.label}
            </span>
          </button>
        ))}
      </div>

      {wins.map((w) => (
        <Window key={w.id} win={w} full={full} onClose={() => close(w.id)} onFocus={() => focus(w.id)} onMove={(x, y) => move(w.id, x, y)}>
          <AppBody id={w.id} data={data} onRide={onRide} />
        </Window>
      ))}
    </div>
  )
}

function Window({
  win,
  full,
  children,
  onClose,
  onFocus,
  onMove,
}: {
  win: Win
  full: boolean
  children: React.ReactNode
  onClose: () => void
  onFocus: () => void
  onMove: (x: number, y: number) => void
}) {
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const style = full
    ? { left: 8, right: 8, top: 44, bottom: 8, zIndex: win.z }
    : { left: win.x, top: win.y, width: 560, height: 420, zIndex: win.z }

  return (
    <div
      className="absolute flex flex-col overflow-hidden rounded-xl bg-[#f8f4ee] shadow-[0_24px_60px_rgba(0,0,0,0.45)] ring-1 ring-black/10 [animation:os-pop_0.32s_cubic-bezier(0.2,1.4,0.4,1)]"
      style={style}
      onPointerDown={onFocus}
    >
      <div
        className="flex h-9 shrink-0 cursor-grab items-center justify-between border-b border-black/10 bg-[#efe7db] px-3 active:cursor-grabbing"
        onPointerDown={(e) => {
          if (full) return
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
          drag.current = { dx: e.clientX - win.x, dy: e.clientY - win.y }
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          // CSS3D scales the screen, so movement is approximate but stays inside the desktop
          onMove(Math.max(-200, Math.min(820, e.clientX - drag.current.dx)), Math.max(32, Math.min(560, e.clientY - drag.current.dy)))
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <div className="flex items-center gap-1.5">
          <button onClick={onClose} aria-label="Close window" className="flex size-3.5 items-center justify-center rounded-full bg-[#ff6a3d] text-[#1b0b05]">
            <X size={8} weight="bold" />
          </button>
          <span className="size-3.5 rounded-full bg-[#ffd43b]" />
          <span className="size-3.5 rounded-full bg-[#8ce99a]" />
        </div>
        <span className="font-mono text-[12px] text-[#5b5f6d]">{TITLES[win.id]}</span>
        <span className="w-12" />
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 py-5 text-[15px] leading-relaxed" onWheel={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function AppBody({ id, data, onRide }: { id: AppId; data: RoomData; onRide: () => void }) {
  switch (id) {
    case 'about':
      return (
        <div className="space-y-3 text-[#2b2e38]">
          <p className="display-tight text-[26px] text-[#1b1d24]">Hi, I&apos;m Satvik.</p>
          <p>
            I&apos;m a fullstack AI engineer at Safe Security in Delhi. I own the risk-scoring engine that runs 72 million
            calculations a month across 6 regions, and the workflow platform customers automate their vendor risk on.
          </p>
          <p>
            Most days that means Go and TypeScript services, Temporal, Postgres, queues, and the AI plumbing that turns
            uploaded documents into answers. Some nights it means being paged about all of the above.
          </p>
          <p>
            In the last six months I also reviewed 352 pull requests for 38 engineers; 34 of those reviews stopped a regression before it shipped.
          </p>
          <p>
            I like making systems boring in production and writing up what breaks them. Open <b>Work</b> for the long
            version, or <b>ride.exe</b> if you would rather drive.
          </p>
        </div>
      )
    case 'work':
      return (
        <div className="space-y-2">
          {data.cases.map((c) => (
            <a
              key={c.slug}
              href={`/work/${c.slug}`}
              onClick={(e) => {
                e.preventDefault()
                openReader('case', c.slug)
              }}
              className="group block rounded-lg px-3 py-3 hover:bg-[#ff6a3d]/10"
            >
              <p className="text-[17px] font-semibold leading-snug text-[#1b1d24] group-hover:text-[#c23a12]">{c.title}</p>
              <p className="mt-1 text-[14px] text-[#5b5f6d]">{c.hook}</p>
              <p className="mt-1.5 flex flex-wrap gap-x-4 font-mono text-[12px] text-[#2b2e38]">
                {c.stats.slice(0, 2).map((s) => (
                  <span key={s.label}>
                    <b>{s.value}</b> {s.label}
                  </span>
                ))}
              </p>
            </a>
          ))}
        </div>
      )
    case 'experience':
      return (
        <div className="space-y-6">
          {roles.map((r) => (
            <div key={r.company}>
              <p className="display-tight text-[22px] text-[#1b1d24]">{r.company}</p>
              <p className="text-[13px] text-[#5b5f6d]">
                {r.title}, {r.period}
              </p>
              <ul className="mt-2 space-y-1.5">
                {r.points.slice(0, 4).map((p, i) => (
                  <li key={i} className="flex gap-2 text-[14px] text-[#2b2e38]">
                    <span className="mt-[0.6em] h-[2px] w-2.5 shrink-0 bg-[#ff6a3d]" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <p className="text-[13px] text-[#5b5f6d]">
              {education.school}, {education.degree}, {education.detail}
            </p>
            <p className="mt-2 font-mono text-[12px] text-[#2b2e38]">{stack.map((s) => s.items).join(', ')}</p>
          </div>
        </div>
      )
    case 'projects':
      return (
        <div className="space-y-4">
          {[
            ['InvestIQ', 'My ET Money plan lapsed, so I built my own: ML ensemble, FinBERT sentiment, and a trading bot where every order passes six risk checks.', 'https://github.com/zen7vik/InvestIQ'],
            ['Bitcask, built then broken', 'A key value store in Go, then a week of SIGKILLs and flipped bits. fsync on every write was 2,940x slower.', 'https://github.com/zen7vik/bitcask-case-study'],
            ['Redis, measured', 'Every internal traced to source and measured. Going from 512 to 513 hash fields costs 4.09x the memory.', site.medium],
            ['Grep vs RAG vs graphs', 'Four ways to give an AI agent code context, measured on 12 real questions. Plain grep was the most reliable.', site.medium],
            ['Heimdall and Mochi', 'My Slack AI teammate: reviews PRs, reads failed builds for the first real error, and watches stuck PRs and deploys. Its dashboard has Mochi, the puppy now walking around this room.', ''],
            ['Code knowledge graphs', 'Daily refreshed code graphs, measured in a blind benchmark of 111 tasks across 17 repos: correctness on par with grep, about 17% fewer files read.', ''],
          ].map(([t, d, href]) => (
            <div key={t}>
              <p className="text-[17px] font-semibold text-[#1b1d24]">
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="underline decoration-[#ff6a3d] decoration-2 underline-offset-4">
                    {t}
                  </a>
                ) : (
                  t
                )}
              </p>
              <p className="mt-1 text-[14px] text-[#2b2e38]">{d}</p>
            </div>
          ))}
          <button onClick={onRide} className="mt-2 rounded-lg bg-[#2f9e44] px-3 py-1.5 text-[13px] font-semibold text-white">
            Or drive around Delhi
          </button>
        </div>
      )
    case 'writing':
      return (
        <div className="space-y-1">
          {data.posts.map((p) => (
            <a
              key={p.id}
              href={p.href}
              target={p.external ? '_blank' : undefined}
              rel="noopener noreferrer"
              onClick={(e) => {
                if (p.external) return
                e.preventDefault()
                openReader('post', p.id)
              }}
              className="group block rounded-lg px-3 py-2.5 hover:bg-[#ff6a3d]/10"
            >
              <p className="font-mono text-[12px] text-[#5b5f6d]">
                {p.date}, {p.minutes} min
              </p>
              <p className="text-[16px] font-semibold leading-snug text-[#1b1d24] group-hover:text-[#c23a12]">{p.title}</p>
            </a>
          ))}
        </div>
      )
    case 'contact':
      return <Contact />
    case 'terminal':
      return <MiniTerminal cases={data.cases} />
  }
}

function Contact() {
  const [copied, setCopied] = useState(false)
  return (
    <div className="space-y-4">
      <p className="display-tight text-[24px] text-[#1b1d24]">Say hi. I reply.</p>
      <button
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(site.email)
            setCopied(true)
          } catch {}
        }}
        className="block rounded-lg bg-[#1b1d24] px-4 py-2.5 font-mono text-[15px] text-[#f3ece2] hover:bg-[#ff6a3d] hover:text-[#1b0b05]"
      >
        {copied ? 'Copied to clipboard' : site.email}
      </button>
      <div className="flex flex-wrap gap-3 text-[15px] font-semibold">
        {[
          ['GitHub', site.github],
          ['LinkedIn', site.linkedin],
          ['Medium', site.medium],
          ['Resume (PDF)', site.resumePath],
        ].map(([l, h]) => (
          <a key={l} href={h} target="_blank" rel="noopener noreferrer" className="underline decoration-[#ff6a3d] decoration-2 underline-offset-4">
            {l}
          </a>
        ))}
      </div>
    </div>
  )
}

function MiniTerminal({ cases }: { cases: RoomData['cases'] }) {
  const [lines, setLines] = useState<string[]>(["satvik@desk: type 'help'"])
  const [input, setInput] = useState('')
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const box = end.current?.closest('.overflow-y-auto')
    if (box) box.scrollTop = box.scrollHeight
  }, [lines])
  return (
    <div className="-mx-6 -my-5 min-h-[calc(100%+2.5rem)] bg-[#14161d] px-5 py-4 font-mono text-[13px] text-[#d6d9e0]" onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement)?.focus()}>
      {lines.map((l, i) => (
        <div key={i} className="whitespace-pre-wrap">
          {l}
        </div>
      ))}
      <div ref={end} className="flex gap-2">
        <span className="text-[#ff6a3d]">$</span>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation()
            if (e.key !== 'Enter') return
            const res = runCommand(input, { cases })
            if (input.trim() === 'clear') setLines([])
            else setLines((ls) => [...ls, `$ ${input}`, ...res.lines])
            setInput('')
            if (res.action?.type === 'navigate' && !openInWorld(res.action.href)) window.location.href = res.action.href
            if (res.action?.type === 'download') window.open(res.action.href, '_blank')
          }}
          className="flex-1 bg-transparent outline-none"
          spellCheck={false}
          aria-label="Terminal input"
        />
      </div>
    </div>
  )
}
