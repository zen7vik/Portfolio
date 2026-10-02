'use client'

import { Suspense, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Physics } from '@react-three/rapier'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import Auto from '@/components/ride/Auto'
import Landmarks from '@/components/ride/Landmarks'
import { ChaiCups, Cones, Cow, Letters, ServerFarm } from '@/components/ride/Props'
import World, { Sky } from '@/components/ride/World'
import { autoPose, setState } from '@/components/ride/store'

const camTarget = new THREE.Vector3()
const lookTarget = new THREE.Vector3()
const look = new THREE.Vector3(0, 1, 0)

function FollowCamera({ far }: { far: boolean }) {
  const { camera } = useThree()
  const yaw = useRef(0)
  const first = useRef(true)

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20)
    let d = autoPose.yaw - yaw.current
    d = Math.atan2(Math.sin(d), Math.cos(d))
    yaw.current += d * (1 - Math.exp(-2.6 * dt))

    const dist = far ? 12.5 : 9.5
    const height = far ? 7.5 : 5.6
    // camera sits behind the auto, slightly lifted, and looks a little ahead of it
    const back = new THREE.Vector3(Math.sin(yaw.current), 0, Math.cos(yaw.current))
    camTarget.set(autoPose.x + back.x * dist, Math.max(autoPose.y, 0) + height, autoPose.z + back.z * dist)
    lookTarget.set(autoPose.x - back.x * 3, Math.max(autoPose.y, 0) + 1, autoPose.z - back.z * 3)

    if (first.current) {
      camera.position.copy(camTarget)
      look.copy(lookTarget)
      first.current = false
    }
    camera.position.lerp(camTarget, 1 - Math.exp(-4 * dt))
    look.lerp(lookTarget, 1 - Math.exp(-6 * dt))
    camera.lookAt(look)
  })
  return null
}

function Ready() {
  const frames = useRef(0)
  useFrame(() => {
    if (++frames.current === 3) setState({ ready: true })
  })
  return null
}

export default function Scene({ mobile }: { mobile: boolean }) {
  useEffect(() => () => setState({ ready: false }), [])

  return (
    <Canvas
      shadows
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ fov: mobile ? 58 : 45, near: 0.1, far: 260, position: [0, 8, 24] }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      style={{ position: 'fixed', inset: 0, touchAction: 'none' }}
    >
      <Sky />
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
        {!mobile && (
          <EffectComposer multisampling={4}>
            <Bloom mipmapBlur luminanceThreshold={1} intensity={0.7} radius={0.6} />
            <Vignette offset={0.3} darkness={0.45} />
          </EffectComposer>
        )}
      </Suspense>
    </Canvas>
  )
}
