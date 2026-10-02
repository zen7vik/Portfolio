'use client'

import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html, RoundedBox } from '@react-three/drei'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { getState, setState, useRide, type LandmarkId } from '@/components/ride/store'
import { sfx } from '@/components/ride/sound'
import { C, LANDMARKS, SKY, polar, type LandmarkDef } from '@/components/ride/world-config'

type Hit = { other: { rigidBodyObject?: THREE.Object3D } }
const isAuto = (e: Hit) => e.other.rigidBodyObject?.name === 'auto'

function Windows({ w, h, d, rows, cols, lit, y0 = 0.6 }: { w: number; h: number; d: number; rows: number; cols: number; lit: boolean; y0?: number }) {
  const cells = useMemo(() => {
    const out: [number, number, boolean][] = []
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) out.push([-w / 2 + (w / cols) * (c + 0.5), y0 + (h / rows) * r, (r * 7 + c * 3) % 5 !== 0])
    return out
  }, [w, h, rows, cols, y0])
  return (
    <>
      {cells.map(([x, y, on], i) => (
        <mesh key={i} position={[x, y, d / 2 + 0.01]}>
          <boxGeometry args={[(w / cols) * 0.55, (h / rows) * 0.5, 0.02]} />
          <meshStandardMaterial
            color={lit && on ? '#ffe3a1' : '#cfe8f3'}
            emissive={lit && on ? '#ffc46b' : '#000000'}
            emissiveIntensity={lit && on ? 1.6 : 0}
            roughness={0.2}
            toneMapped={!(lit && on)}
          />
        </mesh>
      ))}
    </>
  )
}

function Tower({ lit }: { lit: boolean }) {
  return (
    <group>
      <RoundedBox args={[5, 9, 4.4]} radius={0.15} smoothness={4} position={[0, 4.5, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#e7edf0" roughness={0.6} />
      </RoundedBox>
      <Windows w={5} h={8} d={4.4} rows={7} cols={4} lit={lit} y0={1} />
      <RoundedBox args={[3.6, 3, 3.2]} radius={0.12} smoothness={4} position={[0, 10.5, 0]} castShadow>
        <meshStandardMaterial color={C.teal} roughness={0.5} />
      </RoundedBox>
      <Windows w={3.6} h={2.6} d={3.2} rows={2} cols={3} lit={lit} y0={9.6} />
      <RoundedBox args={[3.9, 0.5, 0.3]} radius={0.1} smoothness={3} position={[0, 12.3, 1.5]}>
        <meshStandardMaterial color={C.accent} emissive={C.accent} emissiveIntensity={lit ? 1.6 : 0.3} toneMapped={!lit} />
      </RoundedBox>
      <mesh position={[0, 13.1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1.6, 6]} />
        <meshStandardMaterial color={C.slate} />
      </mesh>
      <mesh position={[0, 13.95, 0]}>
        <sphereGeometry args={[0.15, 10, 8]} />
        <meshStandardMaterial color="#ff4d4d" emissive="#ff3b3b" emissiveIntensity={2.5} toneMapped={false} />
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
  const tape = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (tape.current) tape.current.position.x = 2.6 - ((clock.elapsedTime * 0.9) % 5.6)
  })
  return (
    <group>
      {[-2.6, 2.6].map((x) => (
        <mesh key={x} position={[x, 1.6, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.14, 3.2, 8]} />
          <meshStandardMaterial color={C.slate} />
        </mesh>
      ))}
      <RoundedBox args={[6.4, 3.4, 0.3]} radius={0.12} position={[0, 4.6, 0]} castShadow>
        <meshStandardMaterial color="#1f2433" roughness={0.6} />
      </RoundedBox>
      {candles.map((c, i) => (
        <group key={i} position={[-2.5 + i * 0.55, 3.3 + c.v * 0.6, 0.18]}>
          <mesh>
            <boxGeometry args={[0.26, 0.42, 0.04]} />
            <meshStandardMaterial
              color={c.up ? '#51cf66' : '#ff6b6b'}
              emissive={c.up ? '#40c057' : '#fa5252'}
              emissiveIntensity={1.8}
              toneMapped={false}
            />
          </mesh>
          <mesh>
            <boxGeometry args={[0.04, 0.7, 0.03]} />
            <meshStandardMaterial color={c.up ? '#51cf66' : '#ff6b6b'} />
          </mesh>
        </group>
      ))}
      {/* scrolling tape under the chart */}
      <group position={[0, 3.25, 0.17]}>
        <mesh>
          <boxGeometry args={[6, 0.32, 0.02]} />
          <meshStandardMaterial color="#11141d" />
        </mesh>
        <group ref={tape}>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh key={i} position={[-2.8 + i * 0.7, 0, 0.02]}>
              <boxGeometry args={[0.4, 0.1, 0.01]} />
              <meshStandardMaterial color={C.autoYellow} emissive={C.autoYellow} emissiveIntensity={1.4} toneMapped={false} />
            </mesh>
          ))}
        </group>
      </group>
      <CuboidCollider args={[3.2, 1.7, 0.2]} position={[0, 4.6, 0]} />
      <CuboidCollider args={[0.15, 1.6, 0.15]} position={[-2.6, 1.6, 0]} />
      <CuboidCollider args={[0.15, 1.6, 0.15]} position={[2.6, 1.6, 0]} />
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
      <RoundedBox args={[4.8, 0.8, 0.3]} radius={0.12} position={[0, 5.9, 0.6]} castShadow>
        <meshStandardMaterial color="#1c7ed6" emissive="#1c7ed6" emissiveIntensity={lit ? 1.4 : 0.15} toneMapped={!lit} />
      </RoundedBox>
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
      <CylinderCollider args={[3, 3.2]} position={[0, 3, -2]} />
      <CuboidCollider args={[0.25, 1.3, 0.25]} position={[-1.6, 1.3, 1.6]} />
      <CuboidCollider args={[0.25, 1.3, 0.25]} position={[1.6, 1.3, 1.6]} />
    </group>
  )
}

function Ring({ def }: { def: LandmarkDef }) {
  const active = useRide((s) => s.active === def.id)
  const ring = useRef<THREE.Mesh>(null)
  const beam = useRef<THREE.Mesh>(null)
  const [x, z] = polar(def.angle, 27.4)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
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
          if (getState().active !== def.id) sfx.open()
          setState({ active: def.id as LandmarkId })
        }}
        onIntersectionExit={(e) => {
          if (!isAuto(e as unknown as Hit)) return
          if (getState().active === def.id) setState({ active: null })
        }}
      />
      <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <ringGeometry args={[1.55, 2, 40]} />
        <meshBasicMaterial color={def.color} transparent opacity={active ? 1 : 0.85} toneMapped={false} />
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

const camDir = new THREE.Vector3()
const toLabel = new THREE.Vector3()
const labelWorld = new THREE.Vector3()

// floating sign that hides itself when behind the camera or very far away
function Label({ id, color, name }: { id: LandmarkId; color: string; name: string }) {
  const anchor = useRef<THREE.Group>(null)
  const el = useRef<HTMLDivElement>(null)
  useFrame(({ camera }) => {
    if (!anchor.current || !el.current) return
    anchor.current.getWorldPosition(labelWorld)
    camera.getWorldDirection(camDir)
    toLabel.copy(labelWorld).sub(camera.position)
    const dist = toLabel.length()
    const facing = toLabel.normalize().dot(camDir)
    const show = facing > 0.25 && dist < 70
    el.current.style.opacity = show ? '1' : '0'
  })
  return (
    <group ref={anchor} position={[0, LABEL_HEIGHT[id], 0]}>
      <Html center distanceFactor={22} zIndexRange={[10, 0]}>
        <div ref={el} className="ride-sign" style={{ ['--sign' as string]: color, transition: 'opacity 0.3s' }}>
          {name}
        </div>
      </Html>
    </group>
  )
}

const LABEL_HEIGHT: Record<LandmarkId, number> = {
  tower: 15.2,
  library: 7,
  investiq: 7.2,
  postbox: 4.6,
  paisabazaar: 7.4,
  nit: 8.6,
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
              {l.id === 'tower' && <Tower lit={lit} />}
              {l.id === 'library' && <Library />}
              {l.id === 'investiq' && <Ticker />}
              {l.id === 'postbox' && <Postbox />}
              {l.id === 'paisabazaar' && <Office lit={lit} />}
              {l.id === 'nit' && <Hills />}
              <Label id={l.id} color={l.color} name={l.name} />
            </RigidBody>
            <Ring def={l} />
          </group>
        )
      })}
    </>
  )
}
