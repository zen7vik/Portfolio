'use client'

import { useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { autoPose, getState, setState, useRide, type LandmarkId } from '@/components/ride/store'
import { sfx } from '@/components/ride/sound'
import { C, LANDMARKS, SKY, polar, type LandmarkDef } from '@/components/ride/world-config'

type Hit = { other: { rigidBodyObject?: THREE.Object3D } }
const isAuto = (e: Hit) => e.other.rigidBodyObject?.name === 'auto'

function Windows({ w, h, d, rows, cols, lit, y0 = 0.6 }: { w: number; h: number; d: number; rows: number; cols: number; lit: boolean; y0?: number }) {
  const { on, off } = useMemo(() => {
    const on: [number, number][] = []
    const off: [number, number][] = []
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const cell: [number, number] = [-w / 2 + (w / cols) * (c + 0.5), y0 + (h / rows) * r]
        ;((r * 7 + c * 3) % 5 !== 0 ? on : off).push(cell)
      }
    return { on, off }
  }, [w, h, rows, cols, y0])
  const size: [number, number, number] = [(w / cols) * 0.55, (h / rows) * 0.5, 0.02]
  return (
    <>
      <Cells cells={on} z={d / 2 + 0.01} size={size} lit={lit} />
      <Cells cells={off} z={d / 2 + 0.01} size={size} lit={false} />
    </>
  )
}

function Cells({ cells, z, size, lit }: { cells: [number, number][]; z: number; size: [number, number, number]; lit: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = new THREE.Matrix4()
    cells.forEach(([x, y], i) => ref.current?.setMatrixAt(i, m.makeTranslation(x, y, z)))
    if (ref.current) {
      ref.current.instanceMatrix.needsUpdate = true
      ref.current.computeBoundingSphere()
    }
  }, [cells, z])
  if (!cells.length) return null
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, cells.length]}>
      <boxGeometry args={size} />
      <meshStandardMaterial
        color={lit ? '#ffe3a1' : '#cfe8f3'}
        emissive={lit ? '#ffc46b' : '#000000'}
        emissiveIntensity={lit ? 1.3 : 0}
        roughness={0.2}
      />
    </instancedMesh>
  )
}

function Tower({ lit }: { lit: boolean }) {
  return (
    <group>
      <RoundedBox args={[5.6, 1.2, 5]} radius={0.12} smoothness={4} position={[0, 0.6, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={C.terracotta} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[5, 9, 4.4]} radius={0.15} smoothness={4} position={[0, 4.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#f1e7d8" roughness={0.6} />
      </RoundedBox>
      {[-2.55, 2.55].map((x) => (
        <RoundedBox key={x} args={[0.35, 9.4, 0.5]} radius={0.08} position={[x, 4.7, 2.0]} castShadow>
          <meshStandardMaterial color={C.accent} roughness={0.6} />
        </RoundedBox>
      ))}
      <Windows w={5} h={8} d={4.4} rows={7} cols={4} lit={lit} y0={1} />
      <FacadeSign id="tower" color={C.accent} position={[0, 2.85, 2.55]} width={4.5} />
      <RoundedBox args={[3.6, 3, 3.2]} radius={0.12} smoothness={4} position={[0, 10.5, 0]} castShadow>
        <meshStandardMaterial color={C.teal} roughness={0.5} />
      </RoundedBox>
      <Windows w={3.6} h={2.6} d={3.2} rows={2} cols={3} lit={lit} y0={9.6} />
      <RoundedBox args={[3.9, 0.5, 0.3]} radius={0.1} smoothness={3} position={[0, 12.3, 1.5]}>
        <meshStandardMaterial color={C.accent} emissive={C.accent} emissiveIntensity={lit ? 1.2 : 0.3} />
      </RoundedBox>
      <mesh position={[0, 13.1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.6, 6]} />
        <meshStandardMaterial color={C.slate} />
      </mesh>
      <mesh position={[0, 13.95, 0]}>
        <sphereGeometry args={[0.15, 10, 8]} />
        <meshStandardMaterial color="#ff4d4d" emissive="#ff3b3b" emissiveIntensity={1.6} />
      </mesh>
      <CuboidCollider args={[2.5, 6, 2.2]} position={[0, 6, 0]} />
    </group>
  )
}

function Library() {
  return (
    <group>
      <RoundedBox args={[6, 0.4, 4]} radius={0.08} position={[0, 0.2, 0]} receiveShadow castShadow>
        <meshStandardMaterial color="#e2d6c3" roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[5.4, 3.4, 3]} radius={0.1} position={[0, 2.1, -0.3]} castShadow receiveShadow>
        <meshStandardMaterial color={C.warm} roughness={0.85} />
      </RoundedBox>
      {[-2, -0.7, 0.7, 2].map((x) => (
        <mesh key={x} position={[x, 2.1, 1.5]} castShadow>
          <cylinderGeometry args={[0.22, 0.25, 3.4, 10]} />
          <meshStandardMaterial color="#fffaf2" roughness={0.7} />
        </mesh>
      ))}
      <mesh position={[0, 4.35, 0.2]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[6, 0.35, 3.8]} />
        <meshStandardMaterial color={C.teal} roughness={0.7} />
      </mesh>
      <mesh position={[0, 5.05, 0.2]} rotation={[Math.PI / 2, 0, Math.PI / 2]} scale={[1, 1, 1]} castShadow>
        <cylinderGeometry args={[1.05, 1.05, 3.6, 3]} />
        <meshStandardMaterial color={C.teal} roughness={0.7} />
      </mesh>
      {/* a tower of books */}
      {[C.accent, C.autoYellow, C.teal, C.terracotta, '#4dabf7', C.autoGreen].map((c, i) => (
        <RoundedBox
          key={i}
          args={[1.4 - (i % 2) * 0.15, 0.32, 1]}
          radius={0.05}
          position={[3.9, 0.17 + i * 0.33, 1 + Math.sin(i) * 0.08]}
          rotation={[0, Math.sin(i * 2.1) * 0.25, 0]}
          castShadow
        >
          <meshStandardMaterial color={c} roughness={0.7} />
        </RoundedBox>
      ))}
      <FacadeSign id="library" color={C.teal} position={[0, 4.55, 2.25]} width={4.4} />
      <CuboidCollider args={[3, 2.4, 2]} position={[0, 2.4, 0]} />
      <CuboidCollider args={[0.7, 1, 0.5]} position={[3.9, 1, 1]} />
    </group>
  )
}

function Ticker() {
  const candles = useMemo(
    () =>
      // a hand-shaped up-and-to-the-right series, decoration only
      [1.2, 1.5, 1.3, 1.8, 2.1, 1.9, 2.4, 2.2, 2.7, 3.0].map((v, i, a) => ({ v, up: i === 0 || v >= a[i - 1] })),
    [],
  )
  const visited = useRide((s) => s.visited.includes('investiq'))
  const tape = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    // each dash wraps inside the tape so nothing slides past the board edge
    const t = clock.elapsedTime * 0.9
    tape.current?.children.forEach((d, i) => {
      d.position.x = ((((i * 0.7 - t) % 5.6) + 5.6) % 5.6) - 2.8
    })
  })
  return (
    <group>
      {[-2.6, 2.6].map((x) => (
        <mesh key={x} position={[x, 1.1, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 2.2, 8]} />
          <meshStandardMaterial color={C.slate} />
        </mesh>
      ))}
      <RoundedBox args={[6.4, 3.1, 0.3]} radius={0.12} position={[0, 3.55, 0]} castShadow>
        <meshStandardMaterial color="#1f2433" roughness={0.6} />
      </RoundedBox>
      <Text font={MONA} fontSize={0.48} color="#ffffff" anchorX="left" anchorY="middle" position={[-2.9, 4.68, 0.17]}>
        InvestIQ
      </Text>
      <Text font={MONA} fontSize={0.22} color="#8ce99a" anchorX="right" anchorY="middle" position={[2.9, 4.7, 0.17]}>
        {visited ? 'Visited' : 'My trading app'}
      </Text>
      {candles.map((c, i) => (
        <group key={i} position={[-2.45 + i * 0.54, 2.55 + c.v * 0.55, 0.18]}>
          <mesh>
            <boxGeometry args={[0.26, 0.42, 0.04]} />
            <meshStandardMaterial
              color={c.up ? '#51cf66' : '#ff6b6b'}
              emissive={c.up ? '#40c057' : '#fa5252'}
              emissiveIntensity={1.3}
            />
          </mesh>
          <mesh>
            <boxGeometry args={[0.04, 0.7, 0.03]} />
            <meshStandardMaterial color={c.up ? '#51cf66' : '#ff6b6b'} />
          </mesh>
        </group>
      ))}
      {/* scrolling tape under the chart */}
      <group position={[0, 2.3, 0.17]}>
        <mesh>
          <boxGeometry args={[6.1, 0.3, 0.02]} />
          <meshStandardMaterial color="#11141d" />
        </mesh>
        <group ref={tape}>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} position={[-2.8 + i * 0.7, 0, 0.02]}>
              <boxGeometry args={[0.36, 0.1, 0.01]} />
              <meshStandardMaterial color={C.autoYellow} emissive={C.autoYellow} emissiveIntensity={1.4} />
            </mesh>
          ))}
        </group>
      </group>
      <CuboidCollider args={[3.2, 1.55, 0.2]} position={[0, 3.55, 0]} />
      <CuboidCollider args={[0.15, 1.1, 0.15]} position={[-2.6, 1.1, 0]} />
      <CuboidCollider args={[0.15, 1.1, 0.15]} position={[2.6, 1.1, 0]} />
    </group>
  )
}

function Postbox() {
  return (
    <group scale={1.7}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.55, 0.6, 1.7, 18]} />
        <meshStandardMaterial color={C.postRed} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <sphereGeometry args={[0.56, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={C.postRed} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.72, 0]}>
        <cylinderGeometry args={[0.6, 0.6, 0.08, 18]} />
        <meshStandardMaterial color="#9b1c1c" />
      </mesh>
      <mesh position={[0, 1.35, 0.54]}>
        <boxGeometry args={[0.5, 0.07, 0.06]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 0.95, 0.56]}>
        <boxGeometry args={[0.4, 0.26, 0.02]} />
        <meshStandardMaterial color={C.autoYellow} />
      </mesh>
      {/* a letter sticking out */}
      <mesh position={[0.05, 1.42, 0.58]} rotation={[0.3, 0, 0.1]}>
        <boxGeometry args={[0.32, 0.2, 0.01]} />
        <meshStandardMaterial color={C.warm} />
      </mesh>
      <CylinderCollider args={[1, 0.6]} position={[0, 1, 0]} />
    </group>
  )
}

function Office({ lit }: { lit: boolean }) {
  return (
    <group>
      <RoundedBox args={[5.6, 5.4, 4]} radius={0.14} smoothness={4} position={[0, 2.7, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#dbe7f5" roughness={0.7} />
      </RoundedBox>
      <Windows w={5.6} h={4.4} d={4} rows={4} cols={5} lit={lit} y0={0.9} />
      <FacadeSign id="paisabazaar" color="#1c7ed6" position={[0, 3.8, 2.2]} width={4.8} />
      <RoundedBox args={[1.4, 1.8, 0.2]} radius={0.06} position={[0, 0.9, 2.05]}>
        <meshStandardMaterial color="#9ec5ef" roughness={0.2} />
      </RoundedBox>
      <CuboidCollider args={[2.8, 2.7, 2]} position={[0, 2.7, 0]} />
    </group>
  )
}

function Hills() {
  const clouds = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (clouds.current) clouds.current.position.x = Math.sin(clock.elapsedTime * 0.25) * 1.2
  })
  return (
    <group>
      {[
        [-2.4, 0, -1.4, 3.6, 4.6, '#6a994e'],
        [2, 0, -2, 3, 3.8, '#7fa650'],
        [0, 0, -3.6, 3.8, 6, '#588157'],
      ].map(([x, y, z, r, h, c], i) => (
        <mesh key={i} position={[x as number, (y as number) + (h as number) / 2, z as number]} castShadow receiveShadow>
          <coneGeometry args={[r as number, h as number, 7]} />
          <meshStandardMaterial color={c as string} roughness={0.9} flatShading />
        </mesh>
      ))}
      {/* Meghalaya means abode of the clouds */}
      <group ref={clouds} position={[0, 6.6, -2.4]}>
        {[
          [-1.4, 0, 0, 0.9],
          [-0.4, 0.3, 0.2, 1.1],
          [0.8, 0, 0, 0.85],
          [2.6, -0.8, 0.8, 0.7],
          [3.3, -0.7, 0.8, 0.55],
        ].map(([x, y, z, s], i) => (
          <mesh key={i} position={[x, y, z]} scale={s}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color="#ffffff" roughness={1} flatShading />
          </mesh>
        ))}
      </group>
      {/* campus gate */}
      {[-1.6, 1.6].map((x) => (
        <RoundedBox key={x} args={[0.5, 2.6, 0.5]} radius={0.06} position={[x, 1.3, 1.6]} castShadow>
          <meshStandardMaterial color={C.terracotta} roughness={0.8} />
        </RoundedBox>
      ))}
      <RoundedBox args={[4.2, 0.6, 0.6]} radius={0.08} position={[0, 2.8, 1.6]} castShadow>
        <meshStandardMaterial color={C.terracotta} roughness={0.8} />
      </RoundedBox>
      <FacadeSign id="nit" color={C.grassDark} position={[0, 3.6, 1.9]} width={4.6} />
      <CylinderCollider args={[3, 3.2]} position={[0, 3, -2]} />
      <CuboidCollider args={[0.25, 1.3, 0.25]} position={[-1.6, 1.3, 1.6]} />
      <CuboidCollider args={[0.25, 1.3, 0.25]} position={[1.6, 1.3, 1.6]} />
    </group>
  )
}

const BURST_N = 26
const BURST_COLORS = [C.accent, C.autoYellow, C.autoGreen, C.teal, '#4dabf7', C.warm]

/** A one-off pop of paper bits the first time you reach a landmark. */
function ArrivalBurst({ start }: { start: React.RefObject<number> }) {
  const mesh = useRef<THREE.InstancedMesh>(null)
  const seeds = useMemo(
    () =>
      Array.from({ length: BURST_N }, (_, i) => {
        const a = (i / BURST_N) * Math.PI * 2 + (i % 3) * 0.4
        const sp = 2.2 + ((i * 37) % 10) / 6
        return { vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: 5 + ((i * 13) % 7) / 2, spin: 4 + (i % 5) }
      }),
    [],
  )
  const m = useMemo(() => new THREE.Matrix4(), [])
  const qq = useMemo(() => new THREE.Quaternion(), [])
  const e = useMemo(() => new THREE.Euler(), [])
  const pos = useMemo(() => new THREE.Vector3(), [])
  const sc = useMemo(() => new THREE.Vector3(), [])
  useLayoutEffect(() => {
    const c = new THREE.Color()
    seeds.forEach((_, i) => mesh.current?.setColorAt(i, c.set(BURST_COLORS[i % BURST_COLORS.length])))
    if (mesh.current?.instanceColor) mesh.current.instanceColor.needsUpdate = true
  }, [seeds])
  useFrame(({ clock }) => {
    const g = mesh.current
    if (!g) return
    const age = clock.elapsedTime - (start.current ?? -10)
    g.visible = age >= 0 && age < 1.8
    if (!g.visible) return
    seeds.forEach((s, i) => {
      pos.set(s.vx * age, 1 + s.vy * age - 6 * age * age, s.vz * age)
      e.set(age * s.spin, age * s.spin * 0.7, 0)
      sc.setScalar(Math.max(0, 1 - age / 1.8))
      m.compose(pos, qq.setFromEuler(e), sc)
      g.setMatrixAt(i, m)
    })
    g.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, BURST_N]} visible={false} frustumCulled={false}>
      <boxGeometry args={[0.42, 0.04, 0.26]} />
      <meshBasicMaterial side={THREE.DoubleSide} />
    </instancedMesh>
  )
}

function Ring({ def }: { def: LandmarkDef }) {
  const active = useRide((s) => s.active === def.id)
  const ring = useRef<THREE.Mesh>(null)
  const beam = useRef<THREE.Mesh>(null)
  const burstAt = useRef(-10)
  const clockRef = useRef(0)
  const [x, z] = polar(def.angle, 27.4)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    clockRef.current = t
    // keep the panel open until the auto is clearly away, so driving through fast still shows it
    if (active && Math.hypot(autoPose.x - x, autoPose.z - z) > 7) setState({ active: null })
    if (ring.current) {
      const s = 1 + Math.sin(t * 3) * 0.06
      ring.current.scale.set(s, s, s)
    }
    if (beam.current) (beam.current.material as THREE.MeshBasicMaterial).opacity = (active ? 0.3 : 0.16) + Math.sin(t * 2) * 0.04
  })

  return (
    <RigidBody type="fixed" colliders={false} position={[x, 0, z]}>
      <CylinderCollider
        args={[1.5, 2]}
        position={[0, 1.5, 0]}
        sensor
        onIntersectionEnter={(e) => {
          if (!isAuto(e as unknown as Hit)) return
          const first = !getState().visited.includes(def.id)
          if (first) {
            burstAt.current = clockRef.current
            sfx.arrive()
          } else if (getState().active !== def.id) sfx.open()
          setState({ active: def.id as LandmarkId })
        }}
      />
      <ArrivalBurst start={burstAt} />
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.55, 2, 40]} />
        <meshBasicMaterial color={def.color} transparent opacity={active ? 1 : 0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
        <circleGeometry args={[1.55, 40]} />
        <meshBasicMaterial color={def.color} transparent opacity={0.18} />
      </mesh>
      <mesh ref={beam} position={[0, 1.1, 0]}>
        <cylinderGeometry args={[1.9, 1.75, 2.2, 32, 1, true]} />
        <meshBasicMaterial color={def.color} transparent opacity={0.14} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </RigidBody>
  )
}

const MONA = '/fonts/Mona-Sans-wght-800.ttf'

const SIGN_TEXT: Record<LandmarkId, { title: string; sub: string }> = {
  tower: { title: 'Safe Security', sub: 'Where I work' },
  paisabazaar: { title: 'Paisabazaar', sub: 'My first job' },
  nit: { title: 'NIT Meghalaya', sub: 'Where I studied' },
  investiq: { title: 'InvestIQ', sub: 'My trading app' },
  library: { title: 'Library', sub: 'Things I wrote' },
  postbox: { title: 'Post office', sub: 'Say hi' },
}


/** Name board fixed to a building's face, turned toward the road, low enough to stay in frame. */
function FacadeSign({ id, color, position, width = 4.4 }: { id: LandmarkId; color: string; position: [number, number, number]; width?: number }) {
  const visited = useRide((s) => s.visited.includes(id))
  const t = SIGN_TEXT[id]
  const sub = visited ? 'Visited' : `${t.sub}. Drive into the ring`
  return (
    <group position={position}>
      <RoundedBox args={[width + 0.2, 1.3, 0.1]} radius={0.16} smoothness={3} position={[0.06, -0.07, -0.06]}>
        <meshBasicMaterial color="#222222" />
      </RoundedBox>
      <RoundedBox args={[width, 1.2, 0.14]} radius={0.16} smoothness={3}>
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.35} roughness={0.55} />
      </RoundedBox>
      {/* single line each, shrunk to fit, so title and tagline can never collide */}
      <Text font={MONA} fontSize={Math.min(0.56, (width - 0.4) / (t.title.length * 0.62))} color="#ffffff" anchorX="center" anchorY="middle" position={[0, 0.16, 0.09]} whiteSpace="nowrap">
        {t.title}
      </Text>
      <Text font={MONA} fontSize={Math.min(0.22, (width - 0.4) / (sub.length * 0.6))} color="#ffffff" fillOpacity={0.92} anchorX="center" anchorY="middle" position={[0, -0.33, 0.09]} whiteSpace="nowrap">
        {sub}
      </Text>
    </group>
  )
}

export default function Landmarks() {
  const time = useRide((s) => s.time)
  const lit = SKY[time].lampsOn

  return (
    <>
      {LANDMARKS.map((l) => {
        const [x, z] = polar(l.angle, 31.2)
        const rot = (-l.angle * Math.PI) / 180
        return (
          <group key={l.id}>
            <RigidBody type="fixed" colliders={false} position={[x, 0, z]} rotation={[0, rot, 0]}>
              <group userData={{ occluder: l.id !== 'postbox' }}>
                {l.id === 'tower' && <Tower lit={lit} />}
                {l.id === 'library' && <Library />}
                {l.id === 'investiq' && <Ticker />}
                {l.id === 'postbox' && (
                  <>
                    <Postbox />
                    <group position={[2.7, 0, 0.4]}>
                      <mesh position={[0, 1.05, -0.12]} castShadow>
                        <cylinderGeometry args={[0.08, 0.08, 2.1, 6]} />
                        <meshStandardMaterial color={C.slate} />
                      </mesh>
                      <FacadeSign id="postbox" color={C.postRed} position={[0, 2.5, 0]} width={3.4} />
                    </group>
                  </>
                )}
                {l.id === 'paisabazaar' && <Office lit={lit} />}
                {l.id === 'nit' && <Hills />}
              </group>
            </RigidBody>
            <Ring def={l} />
          </group>
        )
      })}
    </>
  )
}
