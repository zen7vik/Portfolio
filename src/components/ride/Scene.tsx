'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { sanitizeNormals } from '@/components/three/sanitizeNormals'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import Auto from '@/components/ride/Auto'
import Landmarks from '@/components/ride/Landmarks'
import { ChaiCups, Cones, Cow, Letters, ServerFarm } from '@/components/ride/Props'
import World, { Sky } from '@/components/ride/World'
import { autoPose, setState } from '@/components/ride/store'

const camTarget = new THREE.Vector3()
const lookTarget = new THREE.Vector3()
const look = new THREE.Vector3(0, 1, 0)
const back = new THREE.Vector3()
const ray = new THREE.Ray()
const origin = new THREE.Vector3()
const toCam = new THREE.Vector3()
const p = new THREE.Vector3()

// buildings that may block the view; they fade to see-through instead of hiding the auto
type Occluder = { box: THREE.Box3; mats: THREE.Material[]; opacity: number; solid: boolean }
const occluders: Occluder[] = []

function blocking(o: Occluder, cam: THREE.Vector3) {
  if (o.box.containsPoint(origin)) return false
  if (o.box.containsPoint(cam)) return true
  toCam.copy(cam).sub(origin)
  const len = toCam.length()
  ray.set(origin, toCam.normalize())
  return ray.intersectBox(o.box, p) !== null && p.distanceTo(origin) < len
}

function blocks(cam: THREE.Vector3) {
  return occluders.some((o) => blocking(o, cam))
}

// user camera input: drag to orbit, wheel or pinch to zoom; eases back behind the auto while driving
const orbit = { yaw: 0, pitch: 0, zoom: 1, last: -1e9, dragging: false }
const pointers = new Map<number, { x: number; y: number }>()
let pinchStart = 0
let zoomStart = 1

function useOrbitInput(el: HTMLElement) {
  useEffect(() => {
    const now = () => performance.now()
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      el.setPointerCapture?.(e.pointerId)
      orbit.dragging = true
      orbit.last = now()
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()]
        pinchStart = Math.hypot(a.x - b.x, a.y - b.y)
        zoomStart = orbit.zoom
      }
    }
    const move = (e: PointerEvent) => {
      const prev = pointers.get(e.pointerId)
      if (!prev) return
      const dx = e.clientX - prev.x
      const dy = e.clientY - prev.y
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      orbit.last = now()
      if (pointers.size >= 2) {
        const [a, b] = [...pointers.values()]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (pinchStart > 0) orbit.zoom = THREE.MathUtils.clamp(zoomStart * (pinchStart / d), 0.6, 1.8)
        return
      }
      orbit.yaw -= dx * 0.0065
      orbit.pitch = THREE.MathUtils.clamp(orbit.pitch + dy * 0.004, -0.3, 0.6)
    }
    const up = (e: PointerEvent) => {
      pointers.delete(e.pointerId)
      if (pointers.size < 2) pinchStart = 0
      if (pointers.size === 0) orbit.dragging = false
      orbit.last = now()
    }
    const wheel = (e: WheelEvent) => {
      e.preventDefault()
      orbit.zoom = THREE.MathUtils.clamp(orbit.zoom * (1 + e.deltaY * 0.0011), 0.6, 1.8)
      orbit.last = now()
    }
    el.addEventListener('pointerdown', down)
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
    el.addEventListener('wheel', wheel, { passive: false })
    return () => {
      el.removeEventListener('pointerdown', down)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
      el.removeEventListener('wheel', wheel)
      pointers.clear()
      orbit.yaw = 0
      orbit.pitch = 0
      orbit.zoom = 1
      orbit.dragging = false
    }
  }, [el])
}

function FollowCamera({ far }: { far: boolean }) {
  const { camera, gl } = useThree()
  const yaw = useRef(0)
  const first = useRef(true)
  useOrbitInput(gl.domElement)

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    cam.fov = far ? 58 : 45
    cam.updateProjectionMatrix()
  }, [camera, far])

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20)
    let d = autoPose.yaw - yaw.current
    d = Math.atan2(Math.sin(d), Math.cos(d))
    yaw.current += d * (1 - Math.exp(-2.6 * dt))

    // after a moment without input, a moving auto pulls the view back behind it
    if (!orbit.dragging && performance.now() - orbit.last > 2500 && Math.abs(autoPose.speed) > 1.2) {
      orbit.yaw = Math.atan2(Math.sin(orbit.yaw), Math.cos(orbit.yaw))
      orbit.yaw = THREE.MathUtils.damp(orbit.yaw, 0, 2.2, dt)
      orbit.pitch = THREE.MathUtils.damp(orbit.pitch, 0, 2.2, dt)
    }

    const dist0 = far ? 12.5 : 9.5
    const height0 = far ? 7.5 : 5.6
    const elev = THREE.MathUtils.clamp(Math.atan2(height0, dist0) + orbit.pitch, 0.14, 1.25)
    const radius = Math.hypot(height0, dist0) * orbit.zoom
    const dist = Math.cos(elev) * radius
    const height = Math.sin(elev) * radius
    const ground = Math.max(autoPose.y, 0)
    // look a little ahead of the auto when following, straight at it while orbiting
    const ahead = 3 * Math.max(0, 1 - Math.abs(orbit.yaw) * 1.5)
    lookTarget.set(autoPose.x - Math.sin(yaw.current) * ahead, ground + 1, autoPose.z - Math.cos(yaw.current) * ahead)
    const view = yaw.current + orbit.yaw
    back.set(Math.sin(view), 0, Math.cos(view))

    // rise a little over low buildings; anything still in the way fades out below
    origin.set(autoPose.x, ground + 1.6, autoPose.z)
    let lift = 0
    for (let tries = 0; tries < 3; tries++) {
      camTarget.set(autoPose.x + back.x * dist, ground + height + lift, autoPose.z + back.z * dist)
      if (!blocks(camTarget)) break
      lift += 2.5
    }
    if (first.current) {
      camera.position.copy(camTarget)
      look.copy(lookTarget)
      first.current = false
    }
    camera.position.lerp(camTarget, 1 - Math.exp(-(orbit.dragging ? 12 : 5) * dt))
    look.lerp(lookTarget, 1 - Math.exp(-6 * dt))
    camera.lookAt(look)

    for (const o of occluders) {
      // fade fully out: a half-faded building reads as ghost rectangles over the grass
      const target = blocking(o, camera.position) ? 0 : 1
      if (Math.abs(o.opacity - target) < 0.005 && (target > 0 || o.opacity === 0)) continue
      o.opacity = THREE.MathUtils.damp(o.opacity, target, 8, dt)
      if (target === 0 && o.opacity < 0.03) o.opacity = 0
      const solid = o.opacity > 0.98
      const flipped = solid !== o.solid
      o.solid = solid
      for (const m of o.mats) {
        m.opacity = solid ? 1 : o.opacity
        m.visible = o.opacity > 0
        if (!flipped) continue
        // three bakes OPAQUE into the shader, so the switch needs a recompile, once per flip
        m.transparent = !solid
        m.depthWrite = solid
        m.needsUpdate = true
      }
    }
  })
  return null
}

function collectOccluders(scene: THREE.Object3D) {
  occluders.length = 0
  scene.updateMatrixWorld(true)
  scene.traverse((o) => {
    if (!o.userData.occluder) return
    const box = new THREE.Box3().setFromObject(o)
    box.expandByScalar(0.3)
    const mats: THREE.Material[] = []
    o.traverse((c) => {
      const m = (c as THREE.Mesh).material
      if (!m) return
      for (const one of Array.isArray(m) ? m : [m]) if (!mats.includes(one)) mats.push(one)
    })
    occluders.push({ box, mats, opacity: 1, solid: true })
  })
}

function Ready() {
  const frames = useRef(0)
  useFrame(({ scene, gl, camera }) => {
    frames.current++
    if (frames.current === 2) {
      sanitizeNormals(scene)
      collectOccluders(scene)
    }
    if (frames.current === 3) {
      setState({ ready: true })
      if (process.env.NODE_ENV !== 'production') Object.assign((window as unknown as { __ride: object }).__ride ?? {}, { scene, gl, camera, occluders })
    }
    // letters and text load a little later; patch anything new once more
    if (frames.current === 90) sanitizeNormals(scene)
  })
  return null
}

/** Stop rendering while the tab is hidden; resumes on return. */
function PauseWhenHidden() {
  const { setFrameloop } = useThree()
  useEffect(() => {
    const on = () => setFrameloop(document.hidden ? 'never' : 'always')
    document.addEventListener('visibilitychange', on)
    return () => document.removeEventListener('visibilitychange', on)
  }, [setFrameloop])
  return null
}

export default function Scene({ mobile }: { mobile: boolean }) {
  useEffect(() => () => setState({ ready: false }), [])
  const max = mobile ? 1.5 : 1.75
  const [dpr, setDpr] = useState(Math.min(max, typeof window !== 'undefined' ? window.devicePixelRatio : 1))

  return (
    <Canvas
      shadows="percentage"
      dpr={dpr}
      camera={{ fov: mobile ? 58 : 45, near: 0.1, far: 260, position: [0, 8, 24] }}
      gl={{
        antialias: true,
        powerPreference: 'high-performance',
        // ?probe keeps frames readable for the flicker test script
        preserveDrawingBuffer: typeof window !== 'undefined' && window.location.search.includes('probe'),
      }}
      style={{ position: 'fixed', inset: 0, touchAction: 'none' }}
    >
      <PerformanceMonitor
        bounds={() => [45, 58]}
        flipflops={3}
        onDecline={() => setDpr((d) => Math.max(1, Math.round((d - 0.25) * 100) / 100))}
        onIncline={() => setDpr((d) => Math.min(max, Math.round((d + 0.25) * 100) / 100))}
        onFallback={() => setDpr(1)}
      />
      <PauseWhenHidden />
      <Sky mobile={mobile} />
      <Suspense fallback={null}>
        <Physics gravity={[0, -22, 0]} interpolate>
          <World />
          <Landmarks />
          <Letters />
          <ServerFarm />
          <Cones />
          <Cow />
          <ChaiCups />
          <Auto />
        </Physics>
        <FollowCamera far={mobile} />
        <Ready />
      </Suspense>
    </Canvas>
  )
}
