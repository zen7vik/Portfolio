'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useProgress } from '@react-three/drei'
import { SpeakerHigh, SpeakerSlash } from '@phosphor-icons/react'
import Discoveries from '@/components/room/Discoveries'
import SatvikOS from '@/components/room/SatvikOS'
import { setState, useRoom } from '@/components/room/store'
import type { RoomData } from '@/components/room/types'

const Scene = dynamic(() => import('@/components/room/Scene'), { ssr: false, loading: () => null })

function Loader() {
  const { progress } = useProgress()
  const ready = useRoom((s) => s.ready)
  const [gone, setGone] = useState(false)
  useEffect(() => {
    if (!ready) return
    const t = setTimeout(() => setGone(true), 600)
    return () => clearTimeout(t)
  }, [ready])
  if (gone) return null
  const done = ready
  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#141726] text-[#f3ece2] transition-opacity duration-500 ${done ? 'opacity-0' : 'opacity-100'}`}
    >
      <p className="display text-[2.4rem]">Satvik&apos;s room</p>
      <p className="mt-3 text-[1rem] text-[#f3ece2]/70">Brewing chai, waking the cat...</p>
      <div className="mt-6 h-1 w-56 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-[#ff6a3d] transition-[width] duration-300" style={{ width: `${done ? 100 : Math.max(18, progress)}%` }} />
      </div>
    </div>
  )
}

export default function RoomExperience({ data }: { data: RoomData }) {
  const router = useRouter()
  const sound = useRoom((s) => s.sound)
  const focus = useRoom((s) => s.focus)
  const [hint, setHint] = useState(true)
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    const off = () => setHint(false)
    window.addEventListener('pointerdown', off, { once: true })
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setState({ focus: 'room' })
    window.addEventListener('keydown', esc)
    return () => {
      window.removeEventListener('resize', check)
      window.removeEventListener('keydown', esc)
    }
  }, [])

  const ride = () => router.push('/ride')

  return (
    <main className="fixed inset-0 overflow-hidden bg-[#141726]">
      <h1 className="sr-only">Satvik Singh, fullstack AI engineer</h1>
      <div className="absolute inset-0">
        <Scene data={data} onRide={ride} />
      </div>

      {/* name label, like a tag on a diorama */}
      <div
        className={`pointer-events-none absolute left-4 top-4 transition-opacity duration-500 md:left-7 md:top-6 ${focus === 'monitor' ? 'opacity-0' : 'opacity-100'}`}
      >
        <div className="pointer-events-auto rotate-[-1.5deg] rounded-lg bg-[#f8f4ee] px-4 py-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
          <p className="display text-[1.35rem] leading-none text-[#1b1d24]">Satvik Singh</p>
          <p className="mt-1.5 text-[0.82rem] font-medium text-[#5b5f6d]">fullstack AI engineer, Delhi</p>
        </div>
      </div>

      <div
        className={`absolute right-4 top-4 flex items-center gap-2 transition-opacity duration-500 md:right-7 md:top-6 ${focus === 'monitor' ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
        <button
          type="button"
          onClick={() => setState({ sound: !sound })}
          aria-label={sound ? 'Mute sounds' : 'Turn sounds on'}
          className="flex size-10 items-center justify-center rounded-full bg-[#f8f4ee] text-[#1b1d24] shadow-[0_6px_18px_rgba(0,0,0,0.3)] transition-transform hover:-rotate-6 active:scale-90"
        >
          {sound ? <SpeakerHigh size={19} weight="bold" /> : <SpeakerSlash size={19} weight="bold" />}
        </button>
        <Link
          href="/read"
          className="flex h-10 items-center rounded-full bg-[#f8f4ee] px-4 text-[0.88rem] font-semibold text-[#1b1d24] shadow-[0_6px_18px_rgba(0,0,0,0.3)] transition-transform hover:-rotate-2 active:scale-95"
        >
          Skip to read
        </Link>
      </div>


      <div
        className={`pointer-events-none absolute bottom-28 left-1/2 w-max max-w-[88vw] -translate-x-1/2 rounded-full bg-black/45 px-5 py-2.5 text-center text-[0.9rem] md:bottom-6 text-[#f3ece2] backdrop-blur transition-opacity duration-700 ${
          hint && focus === 'room' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        Click anything. Everything in here does something.
      </div>

      {/* phones get the OS as a full screen app instead of a tiny 3D monitor */}
      {narrow && focus === 'monitor' && (
        <div className="fixed inset-0 z-[150] animate-[os-pop_0.3s_ease-out]">
          <SatvikOS full data={data} onExit={() => setState({ focus: 'room' })} onRide={ride} />
        </div>
      )}

      <Discoveries hidden={focus === 'monitor'} />
      <Loader />
    </main>
  )
}
