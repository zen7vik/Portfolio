'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Interactive } from '@/components/room/kit'
import { blip } from '@/components/room/sound'
import { say } from '@/components/room/store'
import { ANCHORS } from '@/components/room/anchors'

const GOLD = '#e3a857'
const CREAM = '#f6dcb0'
const EAR = '#c98a3e'

// open floor spots she wanders between (clear of furniture)
const SPOTS: [number, number][] = [
  [0.4, 0.5],
  [-0.6, 1.3],
  [1.3, 1.1],
  [0.9, -0.5],
  [-0.9, 0.0],
  [1.7, 1.9],
  [-0.2, 1.9],
]

const TRICKS = ['spin', 'jump', 'roll', 'bow'] as const
const LINES = [
  "Woof! I'm Mochi, Heimdall's puppy. I live on Satvik's dashboard.",
  'I remind him to take breaks. He mostly ignores me. Woof.',
  'Did you see the cat? We are not friends. Yet.',
  'Heimdall reviews the PRs. I review the snacks.',
  'Trick unlocked! Click me again.',
]

type Mode = 'walk' | 'idle' | 'trick'

export function Mochi() {
  const root = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Group>(null)
  const legs = useRef<(THREE.Group | null)[]>([])
  const tongue = useRef<THREE.Mesh>(null)
  const state = useRef({
    mode: 'idle' as Mode,
    target: 0,
    until: 2,
    trick: 'spin' as (typeof TRICKS)[number],
    trickT: 0,
    nTricks: 0,
    line: 0,
    yaw: 0,
  })

  useFrame(({ clock, pointer }, dt) => {
    const g = root.current
    if (!g) return
    const t = clock.elapsedTime
    const s = state.current
    const d = Math.min(dt, 0.05)

    if (s.mode === 'walk') {
      const [tx, tz] = SPOTS[s.target]
      const dx = tx - g.position.x
      const dz = tz - g.position.z
      const dist = Math.hypot(dx, dz)
      const want = Math.atan2(dx, dz)
      let diff = want - s.yaw
      diff = Math.atan2(Math.sin(diff), Math.cos(diff))
      s.yaw += diff * Math.min(1, d * 5)
      if (dist < 0.05) {
        s.mode = 'idle'
        s.until = t + 2.5 + Math.random() * 3
      } else {
        const step = Math.min(dist, 0.5 * d)
        g.position.x += Math.sin(s.yaw) * step
        g.position.z += Math.cos(s.yaw) * step
      }
    } else if (s.mode === 'idle' && t > s.until) {
      let next = Math.floor(Math.random() * SPOTS.length)
      if (next === s.target) next = (next + 1) % SPOTS.length
      s.target = next
      s.mode = 'walk'
    }
    g.rotation.y = s.yaw

    // keep her speech bubble above her
    ANCHORS.mochi[0] = g.position.x
    ANCHORS.mochi[2] = g.position.z

    const walking = s.mode === 'walk'
    const gait = walking ? Math.sin(t * 14) : 0
    legs.current.forEach((l, i) => {
      if (l) l.rotation.x = gait * 0.6 * (i % 2 ? 1 : -1) * (i < 2 ? 1 : -1)
    })

    const b = body.current
    if (b) {
      b.position.y = 0.13 + (walking ? Math.abs(Math.sin(t * 14)) * 0.012 : 0)
      b.rotation.set(0, 0, 0)
      if (s.mode === 'trick') {
        const k = Math.min(1, (t - s.trickT) / 1.1)
        const e = Math.sin(k * Math.PI)
        if (s.trick === 'spin') b.rotation.y = k * Math.PI * 2
        if (s.trick === 'jump') b.position.y = 0.13 + e * 0.32
        if (s.trick === 'roll') b.rotation.z = k * Math.PI * 2
        if (s.trick === 'bow') b.rotation.x = e * 0.45
        if (k >= 1) {
          s.mode = 'idle'
          s.until = t + 2
        }
      }
    }

    const h = head.current
    if (h) {
      const look = s.mode === 'idle'
      h.rotation.y += ((look ? pointer.x * 0.7 : 0) - h.rotation.y) * Math.min(1, d * 6)
      h.rotation.x += ((look ? -pointer.y * 0.3 : 0) + Math.sin(t * 3) * 0.04 - h.rotation.x) * Math.min(1, d * 6)
      h.rotation.z = look ? Math.sin(t * 1.7) * 0.12 : 0
    }
    if (tail.current) tail.current.rotation.y = Math.sin(t * (s.mode === 'trick' ? 26 : walking ? 16 : 9)) * 0.6
    if (tongue.current) tongue.current.visible = s.mode !== 'walk'
  })

  const leg = (i: number, x: number, z: number) => (
    <group key={i} ref={(el) => void (legs.current[i] = el)} position={[x, -0.03, z]}>
      <mesh position={[0, -0.05, 0]} castShadow>
        <capsuleGeometry args={[0.028, 0.06, 4, 8]} />
        <meshStandardMaterial color={GOLD} roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.095, 0.01]}>
        <sphereGeometry args={[0.03, 10, 8]} />
        <meshStandardMaterial color={CREAM} roughness={0.9} />
      </mesh>
    </group>
  )

  return (
    <group ref={root} position={[0.4, 0, 0.5]} scale={1.6}>
      <Interactive
        name="mochi"
        hoverLift={0}
        onClick={() => {
          const s = state.current
          s.trick = TRICKS[s.nTricks % TRICKS.length]
          s.nTricks++
          s.mode = 'trick'
          // the next frame stamps the start with the render clock
          s.trickT = Number.NaN
          ;[700, 900].forEach((f, i) => setTimeout(() => blip(f, 0.08, 'square', 0.05), i * 120))
          say('mochi', LINES[s.line % LINES.length], 3600)
          s.line++
        }}
      >
        <TrickClock state={state} />
        <group ref={body} position={[0, 0.13, 0]}>
          {[0, 1, 2, 3].map((i) => leg(i, i % 2 ? 0.06 : -0.06, i < 2 ? 0.09 : -0.09))}
          <mesh scale={[0.85, 0.8, 1.2]} castShadow>
            <sphereGeometry args={[0.11, 20, 16]} />
            <meshStandardMaterial color={GOLD} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.03, 0.05]} scale={[0.7, 0.6, 0.9]}>
            <sphereGeometry args={[0.1, 16, 12]} />
            <meshStandardMaterial color={CREAM} roughness={0.9} />
          </mesh>
          <group ref={tail} position={[0, 0.06, -0.12]}>
            <mesh position={[0, 0.04, -0.03]} rotation={[-0.8, 0, 0]} castShadow>
              <capsuleGeometry args={[0.022, 0.08, 4, 8]} />
              <meshStandardMaterial color={GOLD} roughness={0.9} />
            </mesh>
          </group>
          <group ref={head} position={[0, 0.11, 0.13]}>
            <mesh castShadow>
              <sphereGeometry args={[0.1, 24, 18]} />
              <meshStandardMaterial color={GOLD} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.03, 0.075]} scale={[1, 0.75, 0.9]}>
              <sphereGeometry args={[0.055, 16, 12]} />
              <meshStandardMaterial color={CREAM} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.005, 0.125]}>
              <sphereGeometry args={[0.018, 10, 8]} />
              <meshStandardMaterial color="#2a1d17" roughness={0.3} />
            </mesh>
            <mesh ref={tongue} position={[0, -0.065, 0.1]} rotation={[0.4, 0, 0]} scale={[1, 0.4, 1.3]}>
              <sphereGeometry args={[0.018, 10, 8]} />
              <meshStandardMaterial color="#ef7f8f" />
            </mesh>
            {[-1, 1].map((sx) => (
              <group key={sx}>
                <mesh position={[sx * 0.04, 0.025, 0.085]}>
                  <sphereGeometry args={[0.017, 12, 10]} />
                  <meshStandardMaterial color="#20150f" roughness={0.2} />
                </mesh>
                <mesh position={[sx * 0.044, 0.032, 0.099]}>
                  <sphereGeometry args={[0.005, 6, 6]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh position={[sx * 0.085, 0.02, -0.005]} rotation={[0, 0, sx * 0.35]} scale={[0.45, 1.1, 0.8]} castShadow>
                  <sphereGeometry args={[0.055, 14, 10]} />
                  <meshStandardMaterial color={EAR} roughness={0.9} />
                </mesh>
                <mesh position={[sx * 0.06, -0.02, 0.07]}>
                  <sphereGeometry args={[0.014, 8, 8]} />
                  <meshBasicMaterial color="#f5a3a3" transparent opacity={0.6} />
                </mesh>
              </group>
            ))}
          </group>
        </group>
      </Interactive>
    </group>
  )
}

/** Converts the click's NaN marker into the render clock so tricks start in sync. */
function TrickClock({ state }: { state: React.RefObject<{ trickT: number }> }) {
  useFrame(({ clock }) => {
    if (Number.isNaN(state.current.trickT)) state.current.trickT = clock.elapsedTime
  })
  return null
}
