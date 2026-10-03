'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { AdaptiveDpr, ContactShadows, PerformanceMonitor, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { Avatar } from '@/components/room/Avatar'
import { Beanbag, Bookshelf, Cat, Corkboard, Plant, Poster, ServerRack, WallClock } from '@/components/room/Decor'
import { Chai, DESK_Y, Desk, Lamp, Laptop, Pager } from '@/components/room/Desk'
import { C, Interactive, drag } from '@/components/room/kit'
import { makeScreenTexture } from '@/components/room/screenTexture'
import { sanitizeNormals } from '@/components/three/sanitizeNormals'
import { Heimdall, Kudos } from '@/components/room/Extras'
import { Mochi } from '@/components/room/Mochi'
import { Shell } from '@/components/room/Shell'
import { ANCHORS } from '@/components/room/anchors'
import { bubbleEls } from '@/components/room/BubbleLayer'
import { getState, setState, useRoom } from '@/components/room/store'
import type { RoomData } from '@/components/room/types'

const SCREEN = new THREE.Vector3(0.15, DESK_Y + 0.44, -2.33)
const ROOM_TARGET = new THREE.Vector3(-0.1, 0.85, -0.25)


function Ready() {
  const frames = useRef(0)
  useFrame(({ scene }) => {
    frames.current++
    // patch again once the late text meshes exist
    if (frames.current === 20 || frames.current === 120) sanitizeNormals(scene)
    if (frames.current === 20) setState({ ready: true })
  })
  return null
}

/** Drag anywhere to swing the camera around the room; it eases back when you let go. */
const orbit = { yaw: 0, pitch: 0, tYaw: 0, tPitch: 0, down: false, x: 0, y: 0 }
const off = new THREE.Vector3()

function OrbitDrag() {
  const { gl } = useThree()
  useEffect(() => {
    const el = gl.domElement.parentElement ?? gl.domElement
    const down = (e: PointerEvent) => {
      orbit.down = true
      orbit.x = e.clientX
      orbit.y = e.clientY
      drag.moved = 0
    }
    const move = (e: PointerEvent) => {
      if (!orbit.down) return
      const dx = e.clientX - orbit.x
      const dy = e.clientY - orbit.y
      orbit.x = e.clientX
      orbit.y = e.clientY
      drag.moved += Math.abs(dx) + Math.abs(dy)
      orbit.tYaw = THREE.MathUtils.clamp(orbit.tYaw - dx * 0.006, -0.85, 0.85)
      orbit.tPitch = THREE.MathUtils.clamp(orbit.tPitch + dy * 0.004, -0.25, 0.35)
    }
    const up = () => (orbit.down = false)
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [gl])
  useFrame((_, dt) => {
    if (!orbit.down) {
      // settle back toward the home view
      orbit.tYaw *= Math.exp(-dt * 0.6)
      orbit.tPitch *= Math.exp(-dt * 0.6)
    }
    const k = 1 - Math.exp(-dt * 8)
    orbit.yaw += (orbit.tYaw - orbit.yaw) * k
    orbit.pitch += (orbit.tPitch - orbit.pitch) * k
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
    if (focus !== 'monitor' || narrow) {
      // swing the camera around the look target by the drag offset
      off.copy(pos).sub(look)
      off.applyAxisAngle(THREE.Object3D.DEFAULT_UP, orbit.yaw)
      off.y += orbit.pitch * off.length() * 0.6
      pos.copy(look).add(off)
    }
    cam.position.lerp(pos, k)
    target.lerp(look, k)
    cam.lookAt(target)
  })
  return null
}

/** Moves the DOM speech bubbles to their anchors each frame; no React roots inside the canvas. */
function BubbleProjector() {
  const v = useMemo(() => new THREE.Vector3(), [])
  useFrame(({ camera, size }) => {
    for (const b of getState().bubbles) {
      const el = bubbleEls.get(b.id)
      if (!el) continue
      const a = ANCHORS[b.anchor] ?? [0, 2, 0]
      v.set(a[0], a[1], a[2]).project(camera)
      const behind = v.z > 1
      const x = (v.x * 0.5 + 0.5) * size.width
      const y = (-v.y * 0.5 + 0.5) * size.height
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      el.style.visibility = behind ? 'hidden' : 'visible'
    }
  })
  return null
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
      <OrbitDrag />
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
        <Kudos />
        <Heimdall />
        <Mochi />
        <WallClock />
        <Poster />
        <ServerRack />
        <Plant position={[-2.15, 0, -2.15]} />
        <Beanbag>
          <Cat />
        </Beanbag>
        <ContactShadows position={[0, 0.012, 0]} opacity={0.3} scale={6} blur={2.4} far={2} frames={1} resolution={512} />
        <BubbleProjector />
        <Ready />
      </Suspense>
    </Canvas>
  )
}
