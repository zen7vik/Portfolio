'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox, Text } from '@react-three/drei'
import * as THREE from 'three'
import { DESK_Y } from '@/components/room/Desk'
import { C, Interactive } from '@/components/room/kit'
import { say } from '@/components/room/store'

const HAND = '/fonts/Caveat-wght-600.ttf'

const HEIMDALL_LINES = [
  "I'm Heimdall, Satvik's AI teammate in Slack. I review pull requests and teammates ask for me by name.",
  'I also read failed builds, find the first real error, and suggest the fix before anyone asks.',
  'I keep watch on deploys and PRs that are stuck waiting. Watchman by trade, like the Norse one.',
  'Mochi lives on my dashboard. She is better at reminding him to take breaks than I am.',
]

/** Heimdall, the watchman bot: a small robot whose visor scans the room. */
export function Heimdall() {
  const eye = useRef<THREE.Group>(null)
  const glow = useRef<THREE.MeshStandardMaterial>(null)
  const line = useRef(0)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (eye.current) eye.current.position.x = Math.sin(t * 0.9) * 0.028
    if (glow.current) glow.current.emissiveIntensity = 2.2 + Math.sin(t * 3) * 0.6
  })
  return (
    <group position={[1.32, DESK_Y + 0.03, -1.9]} rotation={[0, -0.6, 0]} scale={1.45}>
      <Interactive
        name="heimdall"
        onClick={() => {
          say('heimdall', HEIMDALL_LINES[line.current % HEIMDALL_LINES.length], 5000)
          line.current++
        }}
      >
        <RoundedBox args={[0.16, 0.05, 0.12]} radius={0.02} position={[0, 0.025, 0]} castShadow>
          <meshStandardMaterial color={C.slate} roughness={0.5} />
        </RoundedBox>
        <RoundedBox args={[0.13, 0.15, 0.11]} radius={0.04} position={[0, 0.13, 0]} castShadow>
          <meshStandardMaterial color="#e9edf2" roughness={0.35} metalness={0.1} />
        </RoundedBox>
        {/* visor */}
        <RoundedBox args={[0.11, 0.045, 0.02]} radius={0.015} position={[0, 0.15, 0.052]}>
          <meshStandardMaterial color="#141826" roughness={0.2} />
        </RoundedBox>
        <group ref={eye} position={[0, 0.15, 0.064]}>
          <mesh>
            <sphereGeometry args={[0.012, 12, 10]} />
            <meshStandardMaterial ref={glow} color="#7cf5d3" emissive="#47e6c0" emissiveIntensity={2.4} toneMapped={false} />
          </mesh>
        </group>
        {/* horn, for the Gjallarhorn */}
        <mesh position={[0.05, 0.235, -0.01]} rotation={[0, 0, -0.5]}>
          <coneGeometry args={[0.014, 0.06, 10]} />
          <meshStandardMaterial color={C.yellow} roughness={0.4} />
        </mesh>
        <mesh position={[-0.03, 0.23, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.05, 6]} />
          <meshStandardMaterial color={C.ink} />
        </mesh>
        <mesh position={[-0.03, 0.26, 0]}>
          <sphereGeometry args={[0.011, 10, 8]} />
          <meshStandardMaterial color={C.accent} emissive={C.accent} emissiveIntensity={1.2} />
        </mesh>
      </Interactive>
    </group>
  )
}

const KUDOS = [
  { by: 'our CPO, on the HTTP node launch', q: 'This is not just a feature, it opens up adding integrations as a configuration.', c: '#ffe066' },
  { by: 'the VP of Engineering, after the Gartner demo', q: 'Great job pulling together the demo we presented at Gartner.', c: '#a5d8ff' },
  { by: 'our go-to-market lead', q: 'This is huge! ... making sure this makes it to the newsletter!', c: '#ffc9c9' },
  { by: 'a peer lead', q: 'Consistently owning ABAC implementation across impacted areas and closing feedback quickly... truly commendable.', c: '#b2f2bb' },
  { by: 'a teammate, on a bug Heimdall and I caught', q: 'Great find!', c: '#ffd8a8' },
  { by: 'a colleague, after one of my presentations', q: 'Awesome slides and animation, can you tell me how did you do that?', c: '#e5dbff' },
]

/** A pinboard of real thank-you notes, attributed by role. */
export function Kudos() {
  const idx = useRef(0)
  return (
    <group position={[2.02, 2.62, -2.52]}>
      <RoundedBox args={[0.84, 0.56, 0.035]} radius={0.015} castShadow receiveShadow>
        <meshStandardMaterial color="#f3ece2" roughness={0.95} />
      </RoundedBox>
      <RoundedBox args={[0.9, 0.62, 0.025]} radius={0.015} position={[0, 0, -0.01]}>
        <meshStandardMaterial color={C.woodDark} />
      </RoundedBox>
      <Text font={HAND} fontSize={0.07} color="#2b2b2b" position={[0, 0.2, 0.022]} anchorX="center">
        Kind words
      </Text>
      {KUDOS.map((k, i) => (
        <group key={i} position={[-0.27 + (i % 3) * 0.27, 0.04 - Math.floor(i / 3) * 0.19, 0.025]} rotation={[0, 0, ((i * 37) % 7) / 25 - 0.12]}>
          <Interactive
            name="kudos"
            hoverLift={0.012}
            onClick={() => {
              const pick = KUDOS[i]
              idx.current = i
              say('kudos', `"${pick.q}" said ${pick.by}.`, 5200)
            }}
          >
            <mesh castShadow>
              <boxGeometry args={[0.2, 0.15, 0.005]} />
              <meshStandardMaterial color={k.c} roughness={0.9} />
            </mesh>
            {[0, 1, 2].map((l) => (
              <mesh key={l} position={[-0.01, 0.03 - l * 0.03, 0.004]}>
                <boxGeometry args={[l === 2 ? 0.1 : 0.15, 0.008, 0.001]} />
                <meshBasicMaterial color="#5b5f6d" transparent opacity={0.5} />
              </mesh>
            ))}
            <mesh position={[0, 0.065, 0.006]}>
              <sphereGeometry args={[0.011, 8, 8]} />
              <meshStandardMaterial color={C.accent} />
            </mesh>
          </Interactive>
        </group>
      ))}
    </group>
  )
}
