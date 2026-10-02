'use client'

import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import { C, Interactive } from '@/components/room/kit'
import { meow } from '@/components/room/sound'
import { say, setState, useRoom } from '@/components/room/store'
import type { RoomData } from '@/components/room/types'

const MONA = '/fonts/Mona-Sans-wght-800.ttf'
const HAND = '/fonts/Caveat-wght-600.ttf'
const BOOK_COLORS = [C.accent, C.teal, '#e9b949', '#4c6ef5', C.terracotta, '#2f9e44', '#e8e1d5', '#8d5ba6']

export function Bookshelf({ posts, onRide }: { posts: RoomData['posts']; onRide: () => void }) {
  const [out, setOut] = useState<number | null>(null)
  const shelves = [0.42, 0.92, 1.42]
  return (
    <group position={[2.02, 0, -2.33]}>
      {/* frame */}
      <RoundedBox args={[0.9, 1.95, 0.04]} radius={0.01} position={[0, 0.975, -0.16]} castShadow receiveShadow>
        <meshStandardMaterial color={C.woodDark} />
      </RoundedBox>
      {[-0.43, 0.43].map((x) => (
        <mesh key={x} position={[x, 0.975, 0]} castShadow>
          <boxGeometry args={[0.04, 1.95, 0.34]} />
          <meshStandardMaterial color={C.wood} />
        </mesh>
      ))}
      {[0.02, ...shelves, 1.93].map((y) => (
        <mesh key={y} position={[0, y, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.035, 0.34]} />
          <meshStandardMaterial color={C.wood} />
        </mesh>
      ))}

      {/* blog posts as books on the middle shelves */}
      {posts.slice(0, 8).map((p, i) => {
        const shelf = i < 4 ? shelves[1] : shelves[0]
        const col = i % 4
        const h = 0.3 + ((i * 37) % 7) * 0.012
        const x = -0.3 + col * 0.13 + (i < 4 ? 0 : 0.06)
        return (
          <Book
            key={p.id}
            position={[x, shelf + 0.02 + h / 2, 0.02]}
            h={h}
            color={BOOK_COLORS[i % BOOK_COLORS.length]}
            pulled={out === i}
            onClick={() => {
              setOut(out === i ? null : i)
              say('shelf', p.title, 7000, {
                label: 'Read it',
                href: p.href,
                external: p.external,
                read: p.external ? undefined : { kind: 'post', id: p.id },
              })
            }}
          />
        )
      })}
      {/* leaning book and a stack on the bottom shelf */}
      <mesh position={[0.3, shelves[1] + 0.17, 0.02]} rotation={[0, 0, -0.35]} castShadow>
        <boxGeometry args={[0.06, 0.3, 0.22]} />
        <meshStandardMaterial color="#6c7a89" />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0.22 - i * 0.01, 0.06 + i * 0.05, 0.02]} rotation={[0, i * 0.15, 0]} castShadow>
          <boxGeometry args={[0.3, 0.045, 0.22]} />
          <meshStandardMaterial color={BOOK_COLORS[(i + 3) % BOOK_COLORS.length]} />
        </mesh>
      ))}
      <GoBuddy position={[-0.22, shelves[2] + 0.02, 0.02]} />
      <ToyAuto position={[0.08, shelves[2] + 0.02, 0.04]} onRide={onRide} />
      <Plant position={[0.3, 1.95, 0.02]} small />
    </group>
  )
}

function Book({
  position,
  h,
  color,
  pulled,
  onClick,
}: {
  position: [number, number, number]
  h: number
  color: string
  pulled: boolean
  onClick: () => void
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.position.z += ((pulled ? 0.14 : 0) - ref.current.position.z) * Math.min(1, dt * 10)
  })
  return (
    <group position={position}>
      <group ref={ref}>
        <Interactive name="book" onClick={onClick} hoverLift={0.02}>
          <RoundedBox args={[0.1, h, 0.24]} radius={0.01} castShadow>
            <meshStandardMaterial color={color} roughness={0.8} />
          </RoundedBox>
          <mesh position={[0, h * 0.25, 0.121]}>
            <planeGeometry args={[0.07, 0.025]} />
            <meshStandardMaterial color="#f3ece2" />
          </mesh>
        </Interactive>
      </group>
    </group>
  )
}

/** A little blue plush, the unofficial mascot of every Go codebase. */
function GoBuddy({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 2.2) * 0.05
  })
  return (
    <group position={position}>
      <Interactive name="gopher" onClick={() => say('shelf', 'Most of my production code is Go. This one reviews my PRs.', 3600)}>
        <group ref={ref}>
          <mesh position={[0, 0.11, 0]} scale={[1, 1.25, 0.9]} castShadow>
            <sphereGeometry args={[0.09, 20, 16]} />
            <meshStandardMaterial color="#79c7e3" roughness={0.9} />
          </mesh>
          {[-0.035, 0.035].map((x) => (
            <group key={x} position={[x, 0.16, 0.07]}>
              <mesh>
                <sphereGeometry args={[0.03, 12, 12]} />
                <meshStandardMaterial color="#ffffff" />
              </mesh>
              <mesh position={[0, 0, 0.022]}>
                <sphereGeometry args={[0.012, 8, 8]} />
                <meshStandardMaterial color="#111" />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.115, 0.085]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshStandardMaterial color="#e8c9a5" />
          </mesh>
          {[-0.06, 0.06].map((x) => (
            <mesh key={x} position={[x, 0.22, 0]}>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshStandardMaterial color="#79c7e3" />
            </mesh>
          ))}
        </group>
      </Interactive>
    </group>
  )
}

/** Toy Delhi auto-rickshaw. Clicking it is the door to the ride world. */
export function ToyAuto({ position, onRide }: { position: [number, number, number]; onRide: () => void }) {
  const ref = useRef<THREE.Group>(null)
  const hovered = useRoom((s) => s.hovered === 'auto')
  useFrame(({ clock }) => {
    if (ref.current) ref.current.position.y = hovered ? Math.abs(Math.sin(clock.elapsedTime * 14)) * 0.012 : 0
  })
  return (
    <group position={position} rotation={[0, -0.5, 0]}>
      <Interactive
        name="auto"
        onClick={() => {
          say('shelf', 'Pom pom! Hold on, taking you for a ride around Delhi.', 2000)
          setTimeout(onRide, 1100)
        }}
      >
        <group ref={ref} scale={0.75}>
          <RoundedBox args={[0.26, 0.1, 0.16]} radius={0.03} position={[0, 0.08, 0]} castShadow>
            <meshStandardMaterial color={C.green} />
          </RoundedBox>
          <RoundedBox args={[0.24, 0.03, 0.18]} radius={0.012} position={[-0.01, 0.24, 0]} castShadow>
            <meshStandardMaterial color={C.yellow} />
          </RoundedBox>
          {[
            [0.1, 0.07],
            [-0.11, 0.07],
            [-0.11, -0.07],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 0.17, z]}>
              <cylinderGeometry args={[0.007, 0.007, 0.13, 6]} />
              <meshStandardMaterial color="#222" />
            </mesh>
          ))}
          <mesh position={[0.13, 0.17, 0]} rotation={[0, 0, 0.35]}>
            <boxGeometry args={[0.01, 0.12, 0.13]} />
            <meshStandardMaterial color="#cfe8ff" transparent opacity={0.6} />
          </mesh>
          {[
            [0.1, 0],
            [-0.08, 0.085],
            [-0.08, -0.085],
          ].map(([x, z], i) => (
            <mesh key={`w${i}`} position={[x, 0.035, z]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.035, 0.035, 0.025, 12]} />
              <meshStandardMaterial color="#1b1b1b" />
            </mesh>
          ))}
        </group>
      </Interactive>
    </group>
  )
}

export function Plant({ position, small = false }: { position: [number, number, number]; small?: boolean }) {
  const leaves = useMemo(
    () =>
      Array.from({ length: small ? 5 : 9 }, (_, i) => ({
        a: (i / (small ? 5 : 9)) * Math.PI * 2 + i * 0.3,
        tilt: 0.35 + (i % 3) * 0.18,
        h: (small ? 0.16 : 0.42) + (i % 4) * (small ? 0.02 : 0.06),
      })),
    [small],
  )
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.02
  })
  const s = small ? 0.35 : 1
  return (
    <group position={position}>
      <Interactive name="plant" onClick={() => say(small ? 'shelf' : 'plant', 'Watered every on-call shift. Still alive. Mostly.', 3000)}>
        <mesh position={[0, 0.14 * s, 0]} castShadow>
          <cylinderGeometry args={[0.17 * s, 0.13 * s, 0.28 * s, 14]} />
          <meshStandardMaterial color={C.terracotta} />
        </mesh>
        <group ref={ref} position={[0, 0.26 * s, 0]}>
          {leaves.map((l, i) => (
            <mesh
              key={i}
              position={[Math.sin(l.a) * 0.05 * s, l.h / 2, Math.cos(l.a) * 0.05 * s]}
              rotation={[Math.cos(l.a) * l.tilt, 0, -Math.sin(l.a) * l.tilt]}
              castShadow
            >
              <coneGeometry args={[0.06 * (small ? 0.5 : 1), l.h, 4]} />
              <meshStandardMaterial color={i % 2 ? '#3f8f4f' : '#5aa860'} flatShading />
            </mesh>
          ))}
        </group>
      </Interactive>
    </group>
  )
}

const NOTES = [
  { t: 'Go', c: '#ffe066', d: 'Go: most of my backend work. Services, Temporal workers, a key value store for fun.' },
  { t: 'TypeScript', c: '#ffc9c9', d: 'TypeScript: the risk engine and a lot of React on top of it.' },
  { t: 'Temporal', c: '#a5d8ff', d: 'Temporal: I own a workflow platform on it, and moved its cluster with a 1 second cutover.' },
  { t: 'RAG', c: '#b2f2bb', d: 'RAG: hybrid vector and keyword search on OpenSearch, feeding questionnaire automation.' },
  { t: 'Postgres', c: '#ffd8a8', d: 'Postgres, MySQL, DynamoDB, Redis. Indexes fixed a lot of my latency problems.' },
  { t: 'Kafka', c: '#e5dbff', d: 'RabbitMQ and Kafka. Retries with backoff, dead letter queues, no infinite loops.' },
  { t: 'AWS', c: '#ffe066', d: 'AWS: ECS, STS cross-account roles, KMS, S3, OpenSearch, Bedrock.' },
  { t: 'React', c: '#a5d8ff', d: 'React: the workflow builder UI and the HTTP node editor.' },
]

export function Corkboard() {
  return (
    <group position={[-0.95, 1.78, -2.52]}>
      <RoundedBox args={[1.15, 0.78, 0.04]} radius={0.015} castShadow receiveShadow>
        <meshStandardMaterial color="#c99a6b" roughness={1} />
      </RoundedBox>
      <RoundedBox args={[1.23, 0.86, 0.03]} radius={0.015} position={[0, 0, -0.012]}>
        <meshStandardMaterial color={C.woodDark} />
      </RoundedBox>
      {NOTES.map((n, i) => {
        const col = i % 4
        const row = Math.floor(i / 4)
        return (
          <Note
            key={n.t}
            position={[-0.4 + col * 0.27, 0.16 - row * 0.32, 0.03]}
            rot={((i * 53) % 11) / 11 - 0.5}
            color={n.c}
            text={n.t}
            onClick={() => say('board', n.d, 4200)}
          />
        )
      })}
    </group>
  )
}

function Note({
  position,
  rot,
  color,
  text,
  onClick,
}: {
  position: [number, number, number]
  rot: number
  color: string
  text: string
  onClick: () => void
}) {
  return (
    <group position={position} rotation={[0, 0, rot * 0.25]}>
      <Interactive name="note" onClick={onClick} hoverLift={0.015}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.22, 0.006]} />
          <meshStandardMaterial color={color} roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.09, 0.008]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial color={C.accent} />
        </mesh>
        <Text font={HAND} fontSize={text.length > 6 ? 0.045 : 0.06} color="#2b2b2b" position={[0, -0.01, 0.005]} anchorX="center" anchorY="middle">
          {text}
        </Text>
      </Interactive>
    </group>
  )
}

export function WallClock() {
  const hr = useRef<THREE.Group>(null)
  const mn = useRef<THREE.Group>(null)
  const sc = useRef<THREE.Group>(null)
  useFrame(() => {
    const d = new Date()
    const s = d.getSeconds() + d.getMilliseconds() / 1000
    const m = d.getMinutes() + s / 60
    const h = (d.getHours() % 12) + m / 60
    if (sc.current) sc.current.rotation.z = -(s / 60) * Math.PI * 2
    if (mn.current) mn.current.rotation.z = -(m / 60) * Math.PI * 2
    if (hr.current) hr.current.rotation.z = -(h / 12) * Math.PI * 2
  })
  const hand = (len: number, w: number, color: string, ref: React.RefObject<THREE.Group | null>, z: number) => (
    <group ref={ref} position={[0, 0, z]}>
      <mesh position={[0, len / 2 - 0.02, 0]}>
        <boxGeometry args={[w, len, 0.006]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
  return (
    <group position={[1.08, 2.32, -2.52]}>
      <Interactive
        name="clock"
        onClick={() => {
          const t = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
          say('clock', `It is ${t} where you are. Thanks for spending some of it here.`, 3600)
        }}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 32]} />
          <meshStandardMaterial color={C.white} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.005]}>
          <cylinderGeometry args={[0.215, 0.215, 0.035, 32]} />
          <meshStandardMaterial color={C.ink} />
        </mesh>
        {Array.from({ length: 12 }, (_, i) => (
          <mesh key={i} position={[Math.sin((i / 12) * Math.PI * 2) * 0.165, Math.cos((i / 12) * Math.PI * 2) * 0.165, 0.022]}>
            <boxGeometry args={[0.012, 0.012, 0.004]} />
            <meshStandardMaterial color={C.ink} />
          </mesh>
        ))}
        <group position={[0, 0, 0.024]}>
          {hand(0.11, 0.018, C.ink, hr, 0)}
          {hand(0.16, 0.012, C.ink, mn, 0.002)}
          {hand(0.17, 0.005, C.accent, sc, 0.004)}
        </group>
      </Interactive>
    </group>
  )
}

/** Home lab rack. Click to take it down; it heals itself, because that is the job. */
export function ServerRack() {
  const broken = useRoom((s) => s.rackBroken)
  const leds = useRef<THREE.InstancedMesh>(null)
  const color = useMemo(() => new THREE.Color(), [])
  useFrame(({ clock }) => {
    const m = leds.current
    if (!m) return
    for (let i = 0; i < 18; i++) {
      const on = broken ? Math.sin(clock.elapsedTime * 10 + i) > 0 : Math.sin(clock.elapsedTime * (3 + (i % 5)) + i * 1.7) > -0.3
      color.set(broken ? (on ? '#ff3b3b' : '#3a1010') : on ? '#3cff8a' : '#0f3a22')
      m.setColorAt(i, color)
    }
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  })
  const positions = useMemo(() => {
    const out: THREE.Matrix4[] = []
    for (let u = 0; u < 6; u++) for (let l = 0; l < 3; l++) out.push(new THREE.Matrix4().setPosition(0.21, 0.12 + u * 0.13, -0.1 + l * 0.04))
    return out
  }, [])
  return (
    <group position={[-2.1, 0, 1.75]} rotation={[0, 0.25, 0]}>
      <Interactive
        name="rack"
        onClick={() => {
          if (broken) return
          setState({ rackBroken: true })
          say('rack', 'Oops. You just took prod down.', 2600)
          setTimeout(() => {
            setState({ rackBroken: false })
            say('rack', 'Self-healed in 3 seconds. Retries, failover, no pager. That is the job.', 4200)
          }, 3000)
        }}
      >
        <RoundedBox args={[0.42, 0.86, 0.4]} radius={0.03} position={[0, 0.43, 0]} castShadow receiveShadow>
          <meshStandardMaterial color="#2a2e3d" roughness={0.6} />
        </RoundedBox>
        {Array.from({ length: 6 }, (_, u) => (
          <mesh key={u} position={[0.205, 0.12 + u * 0.13, 0]}>
            <boxGeometry args={[0.01, 0.1, 0.34]} />
            <meshStandardMaterial color="#3b4256" />
          </mesh>
        ))}
        <instancedMesh
          ref={leds}
          args={[undefined, undefined, 18]}
          onUpdate={(m) => {
            positions.forEach((p, i) => m.setMatrixAt(i, p))
            m.instanceMatrix.needsUpdate = true
          }}
        >
          <boxGeometry args={[0.012, 0.018, 0.018]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
      </Interactive>
    </group>
  )
}

export function Poster() {
  return (
    <group position={[-2.53, 1.75, 1.55]} rotation={[0, Math.PI / 2, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.9, 1.15, 0.02]} />
        <meshStandardMaterial color={C.accent} />
      </mesh>
      <Text font={MONA} fontSize={0.15} lineHeight={0.92} color="#1a0b05" position={[-0.36, 0.42, 0.012]} anchorX="left" anchorY="top" maxWidth={0.75} letterSpacing={-0.04}>
        {'BUILD\nSYSTEMS\nTHAT\nSTAY UP.'}
      </Text>
      <Text font={MONA} fontSize={0.035} color="#1a0b05" position={[-0.36, -0.45, 0.012]} anchorX="left" anchorY="bottom">
        DELHI, NIGHT SHIFT
      </Text>
    </group>
  )
}

export function Beanbag({ children }: { children?: React.ReactNode }) {
  return (
    <group position={[-1.55, 0, 0.45]}>
      <mesh position={[0, 0.2, 0]} scale={[1, 0.6, 1]} castShadow receiveShadow>
        <sphereGeometry args={[0.42, 24, 18]} />
        <meshStandardMaterial color={C.teal} roughness={1} />
      </mesh>
      {children}
    </group>
  )
}

/** Kafka the cat: asleep until you come close, then very interested in your cursor. */
export function Cat() {
  const head = useRef<THREE.Group>(null)
  const tail = useRef<THREE.Group>(null)
  const eyesOpen = useRef<THREE.Group>(null)
  const eyesShut = useRef<THREE.Group>(null)
  const zzz = useRef<THREE.Group>(null)
  const awake = useRoom((s) => s.hovered === 'cat')
  const wakeUntil = useRef(0)

  useFrame(({ clock, pointer }, dt) => {
    const t = clock.elapsedTime
    const up = awake || performance.now() < wakeUntil.current
    const k = Math.min(1, dt * 6)
    if (head.current) {
      head.current.position.y += ((up ? 0.15 : 0.08) - head.current.position.y) * k
      head.current.rotation.y += ((up ? pointer.x * 0.9 + 0.5 : 0.9) - head.current.rotation.y) * k
      head.current.rotation.x += ((up ? -pointer.y * 0.4 : 0.35) - head.current.rotation.x) * k
    }
    if (tail.current) tail.current.rotation.y = Math.sin(t * (up ? 6 : 1.2)) * (up ? 0.5 : 0.15)
    if (eyesOpen.current) eyesOpen.current.visible = up
    if (eyesShut.current) eyesShut.current.visible = !up
    if (zzz.current) {
      zzz.current.visible = !up
      zzz.current.children.forEach((c, i) => {
        const p = (t * 0.35 + i / 3) % 1
        c.position.set(0.1 + p * 0.12, 0.25 + p * 0.3, 0)
        c.scale.setScalar(0.5 + p)
      })
    }
  })

  const fur = '#e08a3c'
  return (
    <group position={[0.02, 0.36, 0.05]} rotation={[0, -0.4, 0]} scale={1.8}>
      <Interactive
        name="cat"
        hoverLift={0}
        onClick={() => {
          wakeUntil.current = performance.now() + 3500
          meow()
          say('cat', ['Mrrp.', 'Meow. (She wants your attention, not your code review.)', 'Kafka: consumer group of one.'][Math.floor(Math.random() * 3)], 2800)
        }}
      >
        <mesh scale={[1.25, 0.7, 0.9]} castShadow>
          <sphereGeometry args={[0.14, 20, 16]} />
          <meshStandardMaterial color={fur} roughness={0.95} />
        </mesh>
        <group ref={head} position={[0.16, 0.08, 0.04]}>
          <mesh castShadow>
            <sphereGeometry args={[0.09, 20, 16]} />
            <meshStandardMaterial color={fur} roughness={0.95} />
          </mesh>
          {[-0.045, 0.045].map((z) => (
            <mesh key={z} position={[0, 0.08, z]} rotation={[z > 0 ? 0.3 : -0.3, 0, 0]} castShadow>
              <coneGeometry args={[0.03, 0.06, 4]} />
              <meshStandardMaterial color={fur} />
            </mesh>
          ))}
          <group ref={eyesOpen}>
            {[-0.035, 0.035].map((z) => (
              <mesh key={z} position={[0.078, 0.015, z]}>
                <sphereGeometry args={[0.016, 10, 10]} />
                <meshStandardMaterial color="#1d1d1d" />
              </mesh>
            ))}
          </group>
          <group ref={eyesShut}>
            {[-0.035, 0.035].map((z) => (
              <mesh key={z} position={[0.085, 0.012, z]}>
                <boxGeometry args={[0.004, 0.005, 0.026]} />
                <meshStandardMaterial color="#1d1d1d" />
              </mesh>
            ))}
          </group>
          <mesh position={[0.088, -0.015, 0]}>
            <sphereGeometry args={[0.011, 8, 8]} />
            <meshStandardMaterial color="#e86a7a" />
          </mesh>
        </group>
        <group ref={tail} position={[-0.17, 0, 0]}>
          <mesh position={[-0.06, 0.02, 0.06]} rotation={[0.2, 0.7, 1.2]} castShadow>
            <capsuleGeometry args={[0.025, 0.18, 4, 8]} />
            <meshStandardMaterial color={fur} />
          </mesh>
        </group>
        <group ref={zzz}>
          {[0, 1, 2].map((i) => (
            <Billboard key={i}>
              <Text font={MONA} fontSize={0.05} color="#f3ece2" outlineWidth={0.004} outlineColor="#1b1d24">
                z
              </Text>
            </Billboard>
          ))}
        </group>
      </Interactive>
    </group>
  )
}
