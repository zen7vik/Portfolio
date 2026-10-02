'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, ContactShadows, Html, PerformanceMonitor, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Avatar } from '@/components/room/Avatar'
import { Beanbag, Bookshelf, Cat, Corkboard, Plant, Poster, ServerRack, WallClock } from '@/components/room/Decor'
import { Chai, DESK_Y, Desk, Lamp, Laptop, Pager } from '@/components/room/Desk'
import { C, Interactive } from '@/components/room/kit'
import { makeScreenTexture } from '@/components/room/screenTexture'
import { Shell } from '@/components/room/Shell'
import { setState, useRoom } from '@/components/room/store'
import { openReader } from '@/components/reader/readerStore'
import type { RoomData } from '@/components/room/types'

const SCREEN = new THREE.Vector3(0.15, DESK_Y + 0.44, -2.33)
const ROOM_TARGET = new THREE.Vector3(-0.1, 0.85, -0.25)

export const ANCHORS: Record<string, [number, number, number]> = {
  avatar: [0.15, 1.72, -1.32],
  lamp: [-0.7, 1.45, -2.2],
  chai: [-0.42, 1.12, -1.82],
  pager: [0.92, 1.08, -1.8],
  laptop: [0.98, 1.32, -2.2],
  shelf: [2.0, 2.15, -2.2],
  board: [-0.95, 2.28, -2.4],
  clock: [1.08, 2.62, -2.45],
  rack: [-2.1, 1.15, 1.75],
  cat: [-1.5, 0.95, 0.45],
  plant: [-2.2, 1.05, -2.15],
  monitor: [0.15, 1.75, -2.3],
  window: [-2.4, 2.35, -0.1],
}

function Ready() {
  const frames = { n: 0 }
  useFrame(() => {
    if (++frames.n === 20) setState({ ready: true })
  })
  return null
}

function Rig({ narrow }: { narrow: boolean }) {
  const focus = useRoom((s) => s.focus)
  const { camera, size } = useThree()
  const target = useMemo(() => ROOM_TARGET.clone(), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const look = useMemo(() => new THREE.Vector3(), [])
  const dbg = useMemo(
    () => (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('cam') : null),
    [],
  )

  useFrame(({ pointer }, dt) => {
    const cam = camera as THREE.PerspectiveCamera
    const k = 1 - Math.exp(-dt * 3.2)
    if (dbg === 'portrait') {
      pos.set(1.5, 1.75, 0.55)
      look.set(0.15, 1.08, -1.4)
      cam.position.copy(pos)
      target.copy(look)
      cam.lookAt(target)
      return
    }
    if (dbg === 'front' || dbg === 'back') {
      // dev-only close-ups of the character
      pos.set(dbg === 'front' ? 0.15 : 0.6, 1.35, dbg === 'front' ? -2.0 : -0.4)
      look.set(0.15, 1.15, -1.32)
      cam.position.copy(pos)
      target.copy(look)
      cam.lookAt(target)
      return
    }
    if (focus === 'monitor' && !narrow) {
      const half = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))
      const d = 1.1 * Math.max(0.68 / (2 * half), 1.12 / (2 * half * (size.width / size.height)))
      pos.set(SCREEN.x, SCREEN.y, SCREEN.z + d)
      look.copy(SCREEN)
    } else if (narrow) {
      pos.set(2.4 + pointer.x * 0.4, 6.6 + pointer.y * 0.2, 11.8)
      look.set(0.15, 0.7, -0.6)
    } else {
      pos.set(7.3 + pointer.x * 0.5, 5.4 + pointer.y * 0.3, 7.3 - pointer.x * 0.3)
      look.copy(ROOM_TARGET)
    }
    const fov = narrow ? 44 : 32
    if (cam.fov !== fov) {
      cam.fov = fov
      cam.updateProjectionMatrix()
    }
    cam.position.lerp(pos, k)
    target.lerp(look, k)
    cam.lookAt(target)
  })
  return null
}

function Bubbles() {
  const bubbles = useRoom((s) => s.bubbles)
  return (
    <>
      {bubbles.map((b) => (
        <Html key={b.id} position={ANCHORS[b.anchor] ?? [0, 2, 0]} center zIndexRange={[100, 90]} style={{ pointerEvents: 'none' }}>
          <div className="pointer-events-none relative w-max max-w-[min(17rem,64vw)] -translate-y-1/2 animate-[bubble-in_0.42s_cubic-bezier(0.2,1.5,0.4,1)] rounded-2xl rounded-bl-sm bg-[#f8f4ee] px-4 py-3 text-[14px] font-medium leading-snug text-[#1b1d24] shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
            {b.text}
            {b.link && (
              <a
                href={b.link.href}
                target={b.link.external ? '_blank' : undefined}
                rel="noopener noreferrer"
                onClick={(e) => {
                  if (!b.link?.read) return
                  e.preventDefault()
                  openReader(b.link.read.kind, b.link.read.id)
                }}
                className="pointer-events-auto mt-2 block font-semibold text-[#c23a12] underline decoration-2 underline-offset-4"
              >
                {b.link.label}
              </a>
            )}
          </div>
        </Html>
      ))}
    </>
  )
}

function Monitor() {
  const focus = useRoom((s) => s.focus)
  const active = focus === 'monitor'
  const { tex, draw } = useMemo(() => makeScreenTexture(), [])
  const glow = useRef<THREE.MeshBasicMaterial>(null)
  useEffect(() => {
    document.fonts?.ready.then(() => draw())
    const id = setInterval(() => draw(), 60000)
    return () => clearInterval(id)
  }, [draw])
  useFrame(({ clock }) => {
    if (glow.current) glow.current.opacity = active ? 0 : 0.18 + Math.sin(clock.elapsedTime * 4) * 0.18
  })
  useEffect(() => () => tex.dispose(), [tex])

  return (
    <group position={[0.15, DESK_Y + 0.03, -2.36]}>
      <mesh position={[0, 0.01, 0.05]} castShadow>
        <boxGeometry args={[0.32, 0.02, 0.2]} />
        <meshStandardMaterial color={C.ink} />
      </mesh>
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.06, 0.34, 0.04]} />
        <meshStandardMaterial color={C.ink} />
      </mesh>
      <Interactive name="monitor" hoverLift={0} onClick={() => !active && setState({ focus: 'monitor' })}>
        <RoundedBox args={[1.12, 0.7, 0.045]} radius={0.02} position={[0, 0.41, 0]} castShadow>
          <meshStandardMaterial color={C.ink} roughness={0.5} />
        </RoundedBox>
        <mesh position={[0, 0.41, 0.0235]}>
          <planeGeometry args={[1.04, 0.624]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
        {/* pulse over the 'click the screen' button, animated on the GPU instead of redrawing the texture */}
        <mesh position={[-0.0955, 0.41 - 0.1179, 0.0245]}>
          <planeGeometry args={[0.24, 0.043]} />
          <meshBasicMaterial ref={glow} color="#ffd2bf" transparent opacity={0} toneMapped={false} depthWrite={false} />
        </mesh>
      </Interactive>
      {/* screen glow onto the desk and the person */}
      <pointLight position={[0, 0.42, 0.35]} intensity={2.6} distance={2.4} color="#9fc3ff" />
    </group>
  )
}

function Lights({ night }: { night: boolean }) {
  return (
    <>
      <hemisphereLight args={[night ? '#7486d6' : '#fff4e2', night ? '#4a3426' : '#b98c6a', night ? 1.05 : 1.2]} />
      <ambientLight intensity={night ? 0.42 : 0.5} />
      <directionalLight
        position={night ? [-6, 4.5, -0.6] : [-6, 6, 1.5]}
        intensity={night ? 0.9 : 2.6}
        color={night ? '#8fa4ff' : '#ffe2b5'}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0005}
      />
      <pointLight position={[2, 2.6, 1.8]} intensity={night ? 2.4 : 0.6} distance={7} color="#ffc98f" />
      {night && <pointLight position={[-0.6, 1.3, -1.6]} intensity={2.2} distance={3.2} color="#ffb46b" />}
    </>
  )
}

export default function Scene({ data, onRide }: { data: RoomData; onRide: () => void }) {
  const night = useRoom((s) => s.night)
  const [dpr, setDpr] = useState(1.75)
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <Canvas
      shadows
      dpr={dpr}
      camera={{ position: [9, 7, 9], fov: 32, near: 0.05, far: 60 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      onPointerMissed={() => document.body.style.removeProperty('cursor')}
    >
      <color attach="background" args={[night ? '#141726' : '#efe3d2']} />
      <fog attach="fog" args={[night ? '#141726' : '#efe3d2', 20, 40]} />
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.75)} flipflops={3} onFallback={() => setDpr(1)} />
      <AdaptiveDpr pixelated={false} />
      <Rig narrow={narrow} />
      <Lights night={night} />
      <Suspense fallback={null}>
        <Shell night={night} />
        <Desk />
        <Monitor />
        <Lamp />
        <Chai />
        <Pager />
        <Laptop />
        <Avatar />
        <Bookshelf posts={data.posts} onRide={onRide} />
        <Corkboard />
        <WallClock />
        <Poster />
        <ServerRack />
        <Plant position={[-2.15, 0, -2.15]} />
        <Beanbag>
          <Cat />
        </Beanbag>
        <ContactShadows position={[0, 0.012, 0]} opacity={0.3} scale={6} blur={2.4} far={2} frames={1} resolution={512} />
        <Bubbles />
        <Ready />
      </Suspense>
    </Canvas>
  )
}
