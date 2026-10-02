'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Stars } from '@react-three/drei'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { autoPose, useRide } from '@/components/ride/store'
import { C, ISLAND_R, LANDMARKS, ROAD_R, ROAD_W, SKY, polar } from '@/components/ride/world-config'

function seeded(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function Tree({ position, scale = 1, tone = 0 }: { position: [number, number, number]; scale?: number; tone?: number }) {
  const greens = [C.grassDark, '#588157', '#7fa650']
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.18, 1, 6]} />
        <meshStandardMaterial color={C.woodDark} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.45, 0]} castShadow>
        <icosahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color={greens[tone % 3]} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0.25, 2.0, 0.1]} castShadow>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color={greens[(tone + 1) % 3]} roughness={0.85} flatShading />
      </mesh>
    </group>
  )
}

function House({ position, rot, color }: { position: [number, number, number]; rot: number; color: string }) {
  return (
    <group position={position} rotation={[0, rot, 0]}>
      <RoundedBox args={[2.2, 1.8, 2]} radius={0.08} position={[0, 0.9, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[2.4, 0.18, 2.2]} radius={0.05} position={[0, 1.85, 0]} castShadow>
        <meshStandardMaterial color={C.warm} roughness={0.8} />
      </RoundedBox>
      {/* water tank, a Delhi rooftop staple */}
      <mesh position={[0.5, 2.25, 0.3]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.6, 10]} />
        <meshStandardMaterial color="#222" roughness={0.6} />
      </mesh>
      <mesh position={[-0.4, 0.75, 1.01]}>
        <boxGeometry args={[0.5, 0.8, 0.02]} />
        <meshStandardMaterial color={C.woodDark} />
      </mesh>
      <mesh position={[0.45, 1.05, 1.01]}>
        <boxGeometry args={[0.45, 0.4, 0.02]} />
        <meshStandardMaterial color="#ffe8a3" emissive="#ffcf70" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

function LampPost({ position, on }: { position: [number, number, number]; on: boolean }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 2.8, 6]} />
        <meshStandardMaterial color={C.slate} roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.85, 0]}>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshStandardMaterial
          color="#fff3d0"
          emissive="#ffc46b"
          emissiveIntensity={on ? 3 : 0}
          toneMapped={!on}
        />
      </mesh>
    </group>
  )
}

function IndiaGate() {
  const [x, z] = polar(180, 31)
  return (
    <group position={[x, 0, z]} rotation={[0, Math.PI, 0]}>
      {[-1.7, 1.7].map((px) => (
        <RoundedBox key={px} args={[1.4, 5, 1.4]} radius={0.06} position={[px, 2.5, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#e6b98a" roughness={0.85} />
        </RoundedBox>
      ))}
      <RoundedBox args={[4.8, 1.3, 1.5]} radius={0.06} position={[0, 5.6, 0]} castShadow>
        <meshStandardMaterial color="#e6b98a" roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[2.2, 0.6, 1.1]} radius={0.06} position={[0, 6.55, 0]} castShadow>
        <meshStandardMaterial color="#dcae7c" roughness={0.85} />
      </RoundedBox>
      <mesh position={[0, 7.05, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.6, 0.45, 12]} />
        <meshStandardMaterial color="#d3a372" roughness={0.85} />
      </mesh>
      <CuboidCollider args={[0.7, 2.5, 0.7]} position={[-1.7, 2.5, 0]} />
      <CuboidCollider args={[0.7, 2.5, 0.7]} position={[1.7, 2.5, 0]} />
    </group>
  )
}

function Kites() {
  const group = useRef<THREE.Group>(null)
  const kites = useMemo(() => {
    const r = seeded(7)
    const colors = [C.accent, C.autoYellow, '#e64980', C.teal, '#7048e8', C.autoGreen]
    return Array.from({ length: 7 }, (_, i) => ({
      x: (r() - 0.5) * 60,
      y: 14 + r() * 8,
      z: (r() - 0.5) * 60,
      c: colors[i % colors.length],
      p: r() * 10,
    }))
  }, [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    group.current?.children.forEach((k, i) => {
      const d = kites[i]
      k.position.y = d.y + Math.sin(t * 0.7 + d.p) * 0.8
      k.position.x = d.x + Math.sin(t * 0.3 + d.p) * 1.5
      k.rotation.z = Math.sin(t * 1.3 + d.p) * 0.25
    })
  })
  return (
    <group ref={group}>
      {kites.map((k, i) => (
        <group key={i} position={[k.x, k.y, k.z]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[1.1, 1.1]} />
            <meshStandardMaterial color={k.c} side={THREE.DoubleSide} roughness={0.7} />
          </mesh>
          <mesh position={[0, -1.1, 0]}>
            <boxGeometry args={[0.02, 1.4, 0.02]} />
            <meshBasicMaterial color={C.warm} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Water({ color }: { color: string }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = -0.75 + Math.sin(clock.elapsedTime * 0.8) * 0.06
  })
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.75, 0]} receiveShadow>
      <circleGeometry args={[220, 48]} />
      <meshStandardMaterial color={color} roughness={0.35} metalness={0.05} />
    </mesh>
  )
}

function Road() {
  const dashes = useMemo(() => {
    const n = 46
    return Array.from({ length: n }, (_, i) => (i / n) * Math.PI * 2)
  }, [])
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]} receiveShadow>
        <ringGeometry args={[ROAD_R - ROAD_W / 2, ROAD_R + ROAD_W / 2, 96]} />
        <meshStandardMaterial color={C.road} roughness={0.95} />
      </mesh>
      {[ROAD_R - ROAD_W / 2 - 0.12, ROAD_R + ROAD_W / 2 + 0.12].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[r - 0.12, r + 0.12, 96]} />
          <meshStandardMaterial color={C.warm} roughness={0.9} />
        </mesh>
      ))}
      {dashes.map((a) => (
        <mesh key={a} position={[Math.sin(a) * ROAD_R, 0.025, -Math.cos(a) * ROAD_R]} rotation={[-Math.PI / 2, 0, -a]}>
          <planeGeometry args={[0.18, 1.2]} />
          <meshStandardMaterial color={C.autoYellow} roughness={0.8} />
        </mesh>
      ))}
      {/* spoke road from spawn plaza out to the ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, 7]} receiveShadow>
        <planeGeometry args={[ROAD_W, 30]} />
        <meshStandardMaterial color={C.road} roughness={0.95} />
      </mesh>
      {/* plaza */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, -2]} receiveShadow>
        <circleGeometry args={[10, 40]} />
        <meshStandardMaterial color="#d8c39a" roughness={0.95} />
      </mesh>
    </group>
  )
}

export function Sky() {
  const time = useRide((s) => s.time)
  const sky = SKY[time]
  const sun = useRef<THREE.DirectionalLight>(null)
  const target = useMemo(() => new THREE.Object3D(), [])

  // the shadow camera follows the auto so shadows stay sharp everywhere
  useFrame(() => {
    if (!sun.current) return
    const offset = time === 'dusk' ? [-22, 14, 10] : time === 'night' ? [12, 22, -14] : [16, 28, 12]
    sun.current.position.set(autoPose.x + offset[0], offset[1], autoPose.z + offset[2])
    target.position.set(autoPose.x, 0, autoPose.z)
    target.updateMatrixWorld()
  })

  return (
    <>
      <color attach="background" args={[sky.bg]} />
      <fog attach="fog" args={[sky.fog, 70, 170]} />
      <hemisphereLight args={[sky.hemiSky, sky.hemiGround, sky.hemiI]} />
      <primitive object={target} />
      <directionalLight
        ref={sun}
        color={sky.sun}
        intensity={sky.sunI}
        target={target}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-28}
        shadow-camera-right={28}
        shadow-camera-top={28}
        shadow-camera-bottom={-28}
        shadow-camera-near={1}
        shadow-camera-far={90}
        shadow-bias={-0.0006}
        shadow-normalBias={0.09}
      />
      {time === 'night' && <Stars radius={110} depth={30} count={1800} factor={4} fade speed={0.6} />}
      {time === 'night' && <pointLight position={[0, 6, -2]} color="#ffc46b" intensity={30} distance={22} />}
    </>
  )
}

export default function World() {
  const time = useRide((s) => s.time)
  const sky = SKY[time]

  const trees = useMemo(() => {
    const r = seeded(42)
    const out: { p: [number, number, number]; s: number; t: number }[] = []
    const landmarkSpots = LANDMARKS.map((l) => polar(l.angle, 31))
    let guard = 0
    while (out.length < 40 && guard++ < 2000) {
      const a = r() * Math.PI * 2
      const rad = 4 + r() * (ISLAND_R - 5)
      const x = Math.sin(a) * rad
      const z = -Math.cos(a) * rad
      const onRing = Math.abs(rad - ROAD_R) < ROAD_W / 2 + 1.6
      const onSpoke = Math.abs(x) < 3.6 && z > -4 && z < 24
      const onPlaza = Math.hypot(x, z + 2) < 11
      const nearLandmark = landmarkSpots.some(([lx, lz]) => Math.hypot(lx - x, lz - z) < 6.5)
      const nearGate = Math.hypot(x - polar(180, 31)[0], z - polar(180, 31)[1]) < 5
      const nearFarm = Math.hypot(x - 11, z - 6) < 9
      const nearCones = x < -6 && x > -15 && z > -8 && z < 10
      if (onRing || onSpoke || onPlaza || nearLandmark || nearGate || nearFarm || nearCones) continue
      out.push({ p: [x, 0, z], s: 0.8 + r() * 0.7, t: Math.floor(r() * 3) })
    }
    return out
  }, [])

  const houses = useMemo(() => {
    const colors = ['#f2c6a0', '#e8a598', '#c9e4de', '#f6e7b4', '#d6ccf0', '#b9d7ea']
    const spots = [-145, -123, -75, 25, 78, 128, 166]
    return spots.map((a, i) => {
      const [x, z] = polar(a, 31.5)
      return { p: [x, 0, z] as [number, number, number], rot: (-a * Math.PI) / 180, c: colors[i % colors.length] }
    })
  }, [])

  const lamps = useMemo(() => Array.from({ length: 14 }, (_, i) => polar((i / 14) * 360 + 12, ROAD_R - ROAD_W / 2 - 0.9)), [])

  return (
    <group>
      {/* island: grass top, sandy rim */}
      <RigidBody type="fixed" colliders={false} name="ground">
        <CylinderCollider args={[1, ISLAND_R]} position={[0, -1, 0]} friction={0.6} />
        <mesh position={[0, -0.72, 0]} receiveShadow>
          <cylinderGeometry args={[ISLAND_R + 1.2, ISLAND_R + 3, 1.2, 48]} />
          <meshStandardMaterial color={C.sand} roughness={0.95} flatShading />
        </mesh>
        <mesh position={[0, -0.1, 0]} receiveShadow>
          <cylinderGeometry args={[ISLAND_R, ISLAND_R + 0.6, 0.2, 48]} />
          <meshStandardMaterial color={C.grass} roughness={0.95} />
        </mesh>
      </RigidBody>
      <Water color={sky.water} />
      <Road />
      {trees.map((t, i) => (
        <Tree key={i} position={t.p} scale={t.s} tone={t.t} />
      ))}
      {trees.map((t, i) => (
        <RigidBody key={`tc${i}`} type="fixed" colliders={false} position={t.p}>
          <CylinderCollider args={[1, 0.25 * t.s]} position={[0, 1, 0]} />
        </RigidBody>
      ))}
      {houses.map((h, i) => (
        <RigidBody key={i} type="fixed" colliders={false} position={h.p} rotation={[0, h.rot, 0]}>
          <CuboidCollider args={[1.1, 1, 1]} position={[0, 1, 0]} />
          <House position={[0, 0, 0]} rot={0} color={h.c} />
        </RigidBody>
      ))}
      {lamps.map(([x, z], i) => (
        <LampPost key={i} position={[x, 0, z]} on={sky.lampsOn} />
      ))}
      <IndiaGate />
      <Kites />
    </group>
  )
}
