'use client'

import { useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useLoader } from '@react-three/fiber'
import { Html, RoundedBox, Text } from '@react-three/drei'
import { CuboidCollider, CylinderCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import { CHAI_TOTAL, autoPose, getState, setState, toast } from '@/components/ride/store'
import { sfx } from '@/components/ride/sound'
import { C, polar } from '@/components/ride/world-config'

type Hit = { other: { rigidBodyObject?: THREE.Object3D } }
const isAuto = (e: Hit) => e.other.rigidBodyObject?.name === 'auto'

/* ---------- SATVIK letters ---------- */

const LETTER_COLORS = [C.accent, C.autoYellow, C.teal, C.terracotta, C.autoGreen, '#4dabf7']

export function Letters() {
  const font = useLoader(FontLoader, '/fonts/helvetiker_bold.typeface.json')
  const letters = useMemo(() => {
    const word = 'SATVIK'
    const geos = word.split('').map((ch) => {
      const g = new TextGeometry(ch, {
        font,
        size: 2.3,
        depth: 0.85,
        curveSegments: 6,
        bevelEnabled: true,
        bevelThickness: 0.12,
        bevelSize: 0.07,
        bevelSegments: 3,
      })
      g.computeBoundingBox()
      g.center()
      return g
    })
    const widths = geos.map((g) => {
      const b = g.boundingBox!
      return b.max.x - b.min.x
    })
    const gap = 0.45
    const total = widths.reduce((a, w) => a + w, 0) + gap * (widths.length - 1)
    let x = -total / 2
    return geos.map((g, i) => {
      const b = g.boundingBox!
      const cx = x + widths[i] / 2
      x += widths[i] + gap
      return {
        g,
        pos: [cx, (b.max.y - b.min.y) / 2 + 0.02, -5] as [number, number, number],
        half: [(b.max.x - b.min.x) / 2, (b.max.y - b.min.y) / 2, (b.max.z - b.min.z) / 2] as [number, number, number],
        color: LETTER_COLORS[i],
      }
    })
  }, [font])

  const lastThump = useRef(0)

  return (
    <>
      {letters.map((l, i) => (
        <RigidBody
          key={i}
          position={l.pos}
          colliders={false}
          linearDamping={0.2}
          angularDamping={0.4}
          onCollisionEnter={(e) => {
            if (!isAuto(e as Hit)) return
            const now = performance.now()
            if (now - lastThump.current > 250 && Math.abs(autoPose.speed) > 3) {
              lastThump.current = now
              sfx.thump()
            }
          }}
        >
          <CuboidCollider args={l.half} mass={1.4} friction={0.7} restitution={0.15} />
          <mesh geometry={l.g} castShadow receiveShadow>
            <meshStandardMaterial color={l.color} roughness={0.55} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

/* ---------- server farm ---------- */

function Rack({ position }: { position: [number, number, number] }) {
  return (
    <>
      <RoundedBox args={[1, 1.15, 0.9]} radius={0.05} smoothness={3} castShadow receiveShadow position={position}>
        <meshStandardMaterial color={C.slate} roughness={0.6} />
      </RoundedBox>
      {/* LED column and one orange status light, two meshes instead of eight */}
      <mesh position={[position[0] - 0.3, position[1] + 0.02, position[2] + 0.452]}>
        <boxGeometry args={[0.07, 0.8, 0.01]} />
        <meshStandardMaterial color="#69db7c" emissive="#51cf66" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[position[0] + 0.15, position[1] + 0.02, position[2] + 0.452]}>
        <boxGeometry args={[0.5, 0.42, 0.01]} />
        <meshStandardMaterial color="#2a2f3e" emissive={C.accent} emissiveIntensity={0.15} />
      </mesh>
    </>
  )
}

export function ServerFarm() {
  const bodies = useRef<(RapierRigidBody | null)[]>([])
  const announced = useRef(false)
  const base: [number, number] = [11, 3]
  const racks = useMemo(() => {
    const out: [number, number, number][] = []
    for (let c = 0; c < 3; c++) for (let h = 0; h < 3; h++) out.push([base[0] + (c - 1) * 1.08, 0.6 + h * 1.17, base[1]])
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useFrame(() => {
    if (announced.current) return
    for (const b of bodies.current) {
      if (!b) continue
      const r = b.rotation()
      const upY = 1 - 2 * (r.x * r.x + r.z * r.z)
      const t = b.translation()
      if (upY < 0.6 || t.y < 0.3) {
        announced.current = true
        setState({ farmDown: true })
        toast('Okay, that one is on me. In prod they stay up.', 4200)
        return
      }
    }
  })

  return (
    <>
      {/* little sign */}
      <group position={[base[0], 0, base[1] - 1.6]} rotation={[0, -0.2, 0]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.08, 1, 0.08]} />
          <meshStandardMaterial color={C.woodDark} />
        </mesh>
        <RoundedBox args={[2.6, 0.62, 0.08]} radius={0.08} smoothness={3} position={[0, 1.25, 0]}>
          <meshStandardMaterial color="#ffffff" roughness={0.7} />
        </RoundedBox>
        <Text font="/fonts/Mona-Sans-wght-800.ttf" fontSize={0.2} color="#222222" anchorX="center" anchorY="middle" position={[0, 1.25, 0.05]} maxWidth={2.4} textAlign="center">
          prod cluster, please do not crash
        </Text>
      </group>
      {racks.map((p, i) => (
        <RigidBody
          key={i}
          ref={(b) => {
            bodies.current[i] = b
          }}
          position={p}
          colliders={false}
          onCollisionEnter={(e) => {
            if (isAuto(e as Hit) && Math.abs(autoPose.speed) > 3) sfx.thump()
          }}
        >
          <CuboidCollider args={[0.5, 0.575, 0.45]} mass={0.9} friction={0.8} />
          <Rack position={[0, 0, 0]} />
        </RigidBody>
      ))}
    </>
  )
}

/* ---------- traffic cones ---------- */

export function Cones() {
  const spots = useMemo(() => {
    const out: [number, number, number][] = []
    for (let i = 0; i < 7; i++) out.push([-10 + (i % 2 ? 1.3 : -1.3), 0.4, 9 - i * 2.6])
    return out
  }, [])
  return (
    <>
      {spots.map((p, i) => (
        <RigidBody key={i} position={p} colliders={false} linearDamping={0.4} angularDamping={0.5}>
          <CuboidCollider args={[0.28, 0.4, 0.28]} mass={0.15} />
          <mesh position={[0, -0.36, 0]} castShadow>
            <boxGeometry args={[0.62, 0.08, 0.62]} />
            <meshStandardMaterial color={C.accent} roughness={0.6} />
          </mesh>
          <mesh castShadow>
            <coneGeometry args={[0.26, 0.75, 12]} />
            <meshStandardMaterial color={C.accent} roughness={0.55} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.15, 0.19, 0.14, 12]} />
            <meshStandardMaterial color={C.warm} roughness={0.6} />
          </mesh>
        </RigidBody>
      ))}
    </>
  )
}

/* ---------- the cow ---------- */

export function Cow() {
  const body = useRef<RapierRigidBody>(null)
  const legs = useRef<THREE.Group>(null)
  const target = useRef(new THREE.Vector3(-8, 0, -12))
  const nextPick = useRef(0)
  const startled = useRef(0)
  const [moo, setMoo] = useState(false)
  const bumps = useRef(0)
  const yaw = useRef(0)

  useFrame(({ clock }, dt) => {
    const b = body.current
    if (!b) return
    const t = clock.elapsedTime
    const p = b.translation()
    if (p.y < -3) {
      b.setTranslation({ x: -8, y: 1, z: -12 }, true)
      b.setLinvel({ x: 0, y: 0, z: 0 }, true)
    }
    if (t > nextPick.current) {
      nextPick.current = t + 5 + Math.random() * 6
      const a = Math.random() * Math.PI * 2
      const r = 4 + Math.random() * 9
      target.current.set(-6 + Math.sin(a) * r * 0.6, 0, -9 + Math.cos(a) * r * 0.6)
    }
    const dx = target.current.x - p.x
    const dz = target.current.z - p.z
    const dist = Math.hypot(dx, dz)
    const v = b.linvel()
    const fleeing = startled.current > performance.now() / 1000
    const speed = fleeing ? 2.2 : dist > 0.6 ? 0.9 : 0
    if (speed > 0) {
      const dirx = fleeing ? p.x - autoPose.x : dx
      const dirz = fleeing ? p.z - autoPose.z : dz
      const n = Math.hypot(dirx, dirz) || 1
      b.setLinvel({ x: (dirx / n) * speed, y: v.y, z: (dirz / n) * speed }, true)
      const want = Math.atan2(dirx, dirz)
      let d = want - yaw.current
      d = Math.atan2(Math.sin(d), Math.cos(d))
      yaw.current += d * Math.min(1, dt * 3)
      b.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current), true)
    }
    if (legs.current) {
      const s = speed > 0 ? Math.sin(t * (fleeing ? 14 : 6)) * 0.35 : 0
      legs.current.children.forEach((l, i) => (l.rotation.x = i % 2 ? s : -s))
    }
  })

  return (
    <RigidBody
      ref={body}
      position={[-8, 1, -12]}
      colliders={false}
      enabledRotations={[false, true, false]}
      linearDamping={1}
      onCollisionEnter={(e) => {
        if (!isAuto(e as Hit)) return
        startled.current = performance.now() / 1000 + 1.6
        setMoo(true)
        sfx.moo()
        bumps.current++
        if (bumps.current === 1) toast('Moo. Gently, please. She has right of way here.')
        else if (bumps.current === 3) toast('The cow has filed an incident report. Severity: moo.')
        setTimeout(() => setMoo(false), 1800)
      }}
    >
      <CuboidCollider args={[0.45, 0.55, 0.85]} position={[0, 0.75, 0]} mass={3} />
      <group>
        <RoundedBox args={[0.9, 0.7, 1.5]} radius={0.18} smoothness={4} position={[0, 0.95, 0]} castShadow>
          <meshStandardMaterial color="#f8f4ec" roughness={0.85} />
        </RoundedBox>
        <mesh position={[0.3, 1.15, 0.2]}>
          <sphereGeometry args={[0.24, 10, 8]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
        </mesh>
        <mesh position={[-0.28, 0.95, -0.35]}>
          <sphereGeometry args={[0.2, 10, 8]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
        </mesh>
        <RoundedBox args={[0.55, 0.5, 0.55]} radius={0.12} smoothness={4} position={[0, 1.25, 0.9]} castShadow>
          <meshStandardMaterial color="#f8f4ec" roughness={0.85} />
        </RoundedBox>
        <RoundedBox args={[0.42, 0.24, 0.2]} radius={0.08} smoothness={3} position={[0, 1.12, 1.2]}>
          <meshStandardMaterial color="#f2b8b5" roughness={0.8} />
        </RoundedBox>
        {[-0.2, 0.2].map((x) => (
          <mesh key={x} position={[x, 1.55, 0.88]} rotation={[0, 0, x > 0 ? -0.5 : 0.5]}>
            <coneGeometry args={[0.05, 0.22, 6]} />
            <meshStandardMaterial color="#e9d8a6" />
          </mesh>
        ))}
        {[-0.14, 0.14].map((x) => (
          <mesh key={x} position={[x, 1.33, 1.17]}>
            <sphereGeometry args={[0.045, 8, 6]} />
            <meshStandardMaterial color="#222" />
          </mesh>
        ))}
        <group ref={legs}>
          {[
            [-0.28, 0.5],
            [0.28, -0.5],
            [0.28, 0.5],
            [-0.28, -0.5],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.32, z]}>
              <boxGeometry args={[0.16, 0.6, 0.16]} />
              <meshStandardMaterial color="#efe9df" />
            </mesh>
          ))}
        </group>
        {moo && (
          <Html position={[0, 2.3, 0.6]} center distanceFactor={8} zIndexRange={[20, 0]}>
            <div className="ride-bubble">Moo.</div>
          </Html>
        )}
      </group>
    </RigidBody>
  )
}

/* ---------- chai cups ---------- */

function onRoad(angle: number, r: number): [number, number, number] {
  const [x, z] = polar(angle, r)
  return [x, 1.1, z]
}

const CHAI_SPOTS: { id: string; p: [number, number, number] }[] = [
  { id: 'ring-ne', p: onRoad(28, 24) },
  { id: 'ring-sw', p: onRoad(-160, 24) },
  { id: 'farm', p: [14.5, 1.1, 7] },
  { id: 'cones', p: [-10, 1.1, -10] },
  { id: 'south', p: onRoad(205, 15) },
  { id: 'plaza', p: [8, 1.1, -8] },
]

function ChaiCup({ id, p }: { id: string; p: [number, number, number] }) {
  const group = useRef<THREE.Group>(null)
  const collected = useRef(false)
  const [gone, setGone] = useState(false)

  useFrame(({ clock }) => {
    if (!group.current) return
    group.current.rotation.y = clock.elapsedTime * 1.4
    group.current.position.y = Math.sin(clock.elapsedTime * 2 + p[0]) * 0.18
  })

  if (gone) return null
  return (
    <RigidBody type="fixed" colliders={false} position={p}>
      <CylinderCollider
        args={[0.8, 0.9]}
        sensor
        onIntersectionEnter={(e) => {
          if (collected.current || !isAuto(e as unknown as Hit)) return
          collected.current = true
          setGone(true)
          sfx.chai()
          const chai = [...getState().chai, id]
          setState({ chai })
          if (chai.length >= CHAI_TOTAL) {
            setState({ celebrate: true })
          } else {
            toast(`Chai ${chai.length} of ${CHAI_TOTAL}. Cutting chai, extra adrak.`, 2200)
          }
        }}
      />
      <group ref={group}>
        <mesh castShadow>
          <cylinderGeometry args={[0.24, 0.18, 0.42, 14]} />
          <meshStandardMaterial color={C.warm} roughness={0.4} transparent opacity={0.95} />
        </mesh>
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 14]} />
          <meshStandardMaterial color="#c08552" roughness={0.6} />
        </mesh>
        <mesh position={[0.26, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.1, 0.03, 6, 12]} />
          <meshStandardMaterial color={C.warm} />
        </mesh>
        <mesh position={[0, -0.6, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.35, 0.5, 24]} />
          <meshBasicMaterial color={C.autoYellow} transparent opacity={0.6} />
        </mesh>
        {[0, 1, 2].map((i) => (
          <Steam key={i} offset={i} />
        ))}
      </group>
    </RigidBody>
  )
}

function Steam({ offset }: { offset: number }) {
  const ref = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    const m = ref.current
    if (!m) return
    const life = (clock.elapsedTime * 0.7 + offset / 3) % 1
    m.position.set(Math.sin(life * 6 + offset) * 0.06, 0.25 + life * 0.7, 0)
    m.scale.setScalar(0.05 + life * 0.09)
    ;(m.material as THREE.MeshBasicMaterial).opacity = 0.6 * (1 - life)
  })
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1, 8, 6]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.5} depthWrite={false} />
    </mesh>
  )
}

export function ChaiCups() {
  return (
    <>
      {CHAI_SPOTS.map((c) => (
        <ChaiCup key={c.id} id={c.id} p={c.p} />
      ))}
    </>
  )
}
