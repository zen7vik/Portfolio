'use client'

import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { C, Interactive } from '@/components/room/kit'
import { say, useRoom } from '@/components/room/store'

const ROOT: [number, number, number] = [0.15, 0, -1.32]
const SEAT = 0.52
// rotation that turns the chair to face the default camera
const FACE_CAMERA = Math.PI + 0.72

const SKIN = '#e9b996'
const SKIN_SHADE = '#d9a580'
const HAIR = '#15100d'
const SHIRT = '#cfe1f3'
const SHIRT_SHADE = '#b7cde4'
const TROUSERS = '#2c303b'
const SHOES = '#6b3e26'

const LINES = [
  "Hey, I'm Satvik. I build backend systems and the AI plumbing behind them.",
  'Click my monitor. That is where the work lives.',
  'Yes, I am on call. Yes, that is my third chai.',
  'The cat is called Kafka. She only processes events she likes.',
  'Go, TypeScript, Temporal, Postgres. Ask the sticky notes.',
  'Want to drive around Delhi? Click the little auto on the shelf.',
]

export function greeting() {
  const h = new Date().getHours()
  let visits = 1
  try {
    visits = Number(localStorage.getItem('visits') ?? '0') + 1
    localStorage.setItem('visits', String(visits))
  } catch {}
  const time = h < 5 ? 'You are up late. Same.' : h < 12 ? 'Good morning.' : h < 17 ? 'Good afternoon.' : h < 21 ? 'Good evening.' : 'Late night? Same.'
  const back = visits > 1 ? ` Welcome back, visit number ${visits}.` : ''
  return `${time}${back} I'm Satvik. Click around, everything here does something.`
}

const mat = (color: string, roughness = 0.75) => <meshStandardMaterial color={color} roughness={roughness} />

export function Avatar() {
  const focus = useRoom((s) => s.focus)
  const roller = useRef<THREE.Group>(null)
  const swivel = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const rArm = useRef<THREE.Group>(null)
  const rFore = useRef<THREE.Group>(null)
  const lArm = useRef<THREE.Group>(null)
  const lFore = useRef<THREE.Group>(null)
  const eyes = useRef<THREE.Group>(null)
  const smile = useRef<THREE.Mesh>(null)
  const turned = useRef(false)
  const turnUntil = useRef(0)
  const line = useRef(0)

  const turnAround = (text: string, ms = 4200) => {
    turned.current = true
    turnUntil.current = performance.now() + ms
    say('avatar', text, ms)
  }

  useEffect(() => {
    const t = setTimeout(() => turnAround(greeting(), 5200), 1600)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (focus === 'monitor') say('avatar', 'All yours. Try the icons.', 2400)
  }, [focus])

  useFrame(({ clock, pointer }, dt) => {
    const t = clock.elapsedTime
    if (turned.current && performance.now() > turnUntil.current) turned.current = false
    const k = 1 - Math.exp(-dt * 7)
    const aside = focus === 'monitor'

    if (roller.current) {
      roller.current.position.x += ((aside ? 0.95 : 0) - roller.current.position.x) * k
      roller.current.position.z += ((aside ? 0.35 : 0) - roller.current.position.z) * k
    }
    const s = swivel.current
    if (s) s.rotation.y += ((turned.current ? FACE_CAMERA : aside ? 0.9 : 0) - s.rotation.y) * (1 - Math.exp(-dt * 4))

    // breathing
    if (body.current) body.current.scale.y = 1 + Math.sin(t * 2.1) * 0.012

    // occasional glance over the shoulder toward the cursor
    const glance = !turned.current && !aside && t % 11 > 8.6
    const h = head.current
    if (h) {
      const yaw = turned.current ? pointer.x * 0.35 : glance ? -1.1 + pointer.x * 0.2 : Math.sin(t * 0.7) * 0.06
      const pitch = turned.current ? -pointer.y * 0.18 : glance ? -0.05 : 0.06 + Math.sin(t * 1.3) * 0.02
      h.rotation.y += (yaw - h.rotation.y) * k
      h.rotation.x += (pitch - h.rotation.x) * k
      h.rotation.z = turned.current ? Math.sin(t * 2) * 0.05 : 0
    }

    if (eyes.current) eyes.current.scale.y = t % 3.7 < 0.12 ? 0.12 : 1
    if (smile.current) smile.current.scale.x += ((turned.current ? 1.25 : 0.9) - smile.current.scale.x) * k

    // arms: positive x rotation swings the arm forward, toward the desk
    if (rArm.current && rFore.current && lArm.current && lFore.current) {
      if (turned.current) {
        rArm.current.rotation.x += (0.15 - rArm.current.rotation.x) * k
        rArm.current.rotation.z += (2.45 - rArm.current.rotation.z) * k
        rFore.current.rotation.x += (0.2 - rFore.current.rotation.x) * k
        rFore.current.rotation.z = 0.35 + Math.sin(t * 11) * 0.45
        lArm.current.rotation.x += (0.35 - lArm.current.rotation.x) * k
        lArm.current.rotation.z += (-0.1 - lArm.current.rotation.z) * k
        lFore.current.rotation.x += (1.05 - lFore.current.rotation.x) * k
      } else {
        const tap = (o: number) => Math.max(0, Math.sin(t * 15 + o)) * 0.09
        rArm.current.rotation.x += (0.95 - rArm.current.rotation.x) * k
        rArm.current.rotation.z += (0.14 - rArm.current.rotation.z) * k
        rFore.current.rotation.z += (0 - rFore.current.rotation.z) * k
        rFore.current.rotation.x = 0.6 - tap(0)
        lArm.current.rotation.x += (0.95 - lArm.current.rotation.x) * k
        lArm.current.rotation.z += (-0.14 - lArm.current.rotation.z) * k
        lFore.current.rotation.x = 0.6 - tap(1.7)
      }
    }
  })

  return (
    <group position={ROOT}>
      <group ref={roller}>
        <group ref={swivel}>
          <Interactive
            name="avatar"
            hoverLift={0}
            onClick={() => {
              turnAround(LINES[line.current % LINES.length])
              line.current++
            }}
          >
            <Chair />

            {/* legs: thighs forward along -z, shins down */}
            {[-0.1, 0.1].map((x) => (
              <group key={x}>
                <RoundedBox args={[0.14, 0.14, 0.44]} radius={0.06} position={[x, SEAT + 0.07, -0.19]} castShadow>
                  {mat(TROUSERS)}
                </RoundedBox>
                <RoundedBox args={[0.125, 0.46, 0.13]} radius={0.055} position={[x, SEAT - 0.2, -0.38]} castShadow>
                  {mat(TROUSERS)}
                </RoundedBox>
                <RoundedBox args={[0.13, 0.08, 0.23]} radius={0.035} position={[x, 0.045, -0.45]} castShadow>
                  {mat(SHOES, 0.45)}
                </RoundedBox>
              </group>
            ))}

            <group ref={body}>
              {/* shirt torso */}
              <RoundedBox args={[0.38, 0.46, 0.24]} radius={0.1} position={[0, SEAT + 0.31, 0.02]} rotation={[-0.06, 0, 0]} castShadow>
                {mat(SHIRT, 0.8)}
              </RoundedBox>
              {/* button placket and buttons on the front (-z) */}
              <mesh position={[0, SEAT + 0.3, -0.103]}>
                <boxGeometry args={[0.03, 0.36, 0.006]} />
                {mat(SHIRT_SHADE)}
              </mesh>
              {[0.42, 0.32, 0.22, 0.12].map((y) => (
                <mesh key={y} position={[0, SEAT + y, -0.108]}>
                  <sphereGeometry args={[0.009, 8, 8]} />
                  {mat('#f4f6f8', 0.3)}
                </mesh>
              ))}
              {/* collar */}
              {[-1, 1].map((sx) => (
                <mesh key={sx} position={[sx * 0.045, SEAT + 0.52, -0.075]} rotation={[0.55, 0, sx * -0.55]} castShadow>
                  <boxGeometry args={[0.065, 0.035, 0.012]} />
                  {mat('#e6f0fa', 0.7)}
                </mesh>
              ))}
              {/* belt */}
              <mesh position={[0, SEAT + 0.1, 0.02]}>
                <boxGeometry args={[0.39, 0.035, 0.25]} />
                {mat('#3a2a20', 0.5)}
              </mesh>
              <Arm side={1} arm={rArm} fore={rFore} />
              <Arm side={-1} arm={lArm} fore={lFore} watch />

              {/* head */}
              <group ref={head} position={[0, SEAT + 0.74, 0]}>
                <mesh position={[0, -0.13, 0.005]}>
                  <cylinderGeometry args={[0.048, 0.055, 0.1, 12]} />
                  {mat(SKIN_SHADE)}
                </mesh>
                <mesh scale={[0.95, 1.07, 0.98]} castShadow>
                  <sphereGeometry args={[0.15, 32, 24]} />
                  {mat(SKIN, 0.6)}
                </mesh>
                {/* ears */}
                {[-1, 1].map((sx) => (
                  <mesh key={sx} position={[sx * 0.142, -0.005, 0.01]} scale={[0.5, 1, 0.8]}>
                    <sphereGeometry args={[0.035, 12, 10]} />
                    {mat(SKIN_SHADE)}
                  </mesh>
                ))}
                {/* hair: a cap tilted so the hairline is high at the forehead and low at the nape */}
                <mesh rotation={[0.42, 0, 0]} scale={[1.0, 1.04, 1.0]} castShadow>
                  <sphereGeometry args={[0.157, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                  {mat(HAIR, 0.88)}
                </mesh>
                <mesh position={[0, 0.07, 0.01]} scale={[1.02, 0.62, 1.04]} castShadow>
                  <sphereGeometry args={[0.152, 32, 20]} />
                  {mat(HAIR, 0.85)}
                </mesh>
                <mesh position={[0.01, 0.15, -0.075]} rotation={[-0.5, 0, -0.18]} scale={[1.35, 0.62, 0.95]} castShadow>
                  <sphereGeometry args={[0.085, 24, 16]} />
                  {mat(HAIR, 0.8)}
                </mesh>
                <mesh position={[0.06, 0.13, -0.1]} rotation={[-0.2, 0.3, -0.5]} scale={[1.1, 0.42, 0.7]}>
                  <sphereGeometry args={[0.07, 20, 14]} />
                  {mat(HAIR, 0.8)}
                </mesh>
                <mesh position={[-0.07, 0.125, -0.07]} rotation={[-0.3, 0, 0.35]} scale={[0.9, 0.45, 0.8]}>
                  <sphereGeometry args={[0.06, 16, 12]} />
                  {mat(HAIR, 0.8)}
                </mesh>

                {/* face, on the -z side */}
                <group position={[0, 0, -0.142]}>
                  {/* brows */}
                  {[-1, 1].map((sx) => (
                    <mesh key={sx} position={[sx * 0.05, 0.05, -0.004]} rotation={[0, 0, Math.PI / 2 + sx * -0.16]}>
                      <capsuleGeometry args={[0.0065, 0.036, 4, 8]} />
                      {mat(HAIR)}
                    </mesh>
                  ))}
                  <group ref={eyes}>
                    {[-1, 1].map((sx) => (
                      <group key={sx} position={[sx * 0.05, 0.012, 0]}>
                        <mesh scale={[1, 1.15, 0.6]}>
                          <sphereGeometry args={[0.0165, 14, 12]} />
                          <meshStandardMaterial color="#20150f" roughness={0.2} />
                        </mesh>
                        <mesh position={[0.007, 0.008, -0.009]}>
                          <sphereGeometry args={[0.0055, 8, 8]} />
                          <meshBasicMaterial color="#ffffff" />
                        </mesh>
                      </group>
                    ))}
                  </group>
                  {/* nose */}
                  <mesh position={[0, -0.022, -0.012]} scale={[0.8, 1, 1]}>
                    <sphereGeometry args={[0.018, 12, 10]} />
                    {mat(SKIN_SHADE)}
                  </mesh>
                  {/* moustache */}
                  <mesh position={[0, -0.05, -0.006]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.7]}>
                    <capsuleGeometry args={[0.0058, 0.046, 4, 8]} />
                    {mat(HAIR)}
                  </mesh>
                  {/* smile */}
                  <mesh ref={smile} position={[0, -0.07, 0.001]} rotation={[0, 0, Math.PI]} scale={[1, 0.55, 1]}>
                    <torusGeometry args={[0.017, 0.0026, 6, 16, Math.PI]} />
                    <meshStandardMaterial color="#5a2a1f" />
                  </mesh>
                  {/* goatee: a short chin strip */}
                  <mesh position={[0, -0.106, 0.009]} scale={[1.05, 0.75, 0.3]}>
                    <sphereGeometry args={[0.014, 14, 10]} />
                    {mat(HAIR, 0.9)}
                  </mesh>
                </group>
              </group>
            </group>
          </Interactive>
        </group>
      </group>
    </group>
  )
}

function Arm({
  side,
  arm,
  fore,
  watch = false,
}: {
  side: number
  arm: React.RefObject<THREE.Group | null>
  fore: React.RefObject<THREE.Group | null>
  watch?: boolean
}) {
  return (
    <group ref={arm} position={[side * 0.215, SEAT + 0.5, 0.02]} rotation={[0.95, 0, side * 0.14]}>
      <RoundedBox args={[0.1, 0.27, 0.1]} radius={0.045} position={[0, -0.12, 0]} castShadow>
        {mat(SHIRT, 0.8)}
      </RoundedBox>
      <group ref={fore} position={[0, -0.25, 0]} rotation={[0.6, 0, 0]}>
        {/* rolled sleeve cuff */}
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.052, 0.052, 0.05, 14]} />
          {mat(SHIRT_SHADE, 0.8)}
        </mesh>
        <RoundedBox args={[0.075, 0.24, 0.075]} radius={0.035} position={[0, -0.14, 0]} castShadow>
          {mat(SKIN, 0.6)}
        </RoundedBox>
        {watch && (
          <group position={[0, -0.225, 0]}>
            <mesh>
              <cylinderGeometry args={[0.042, 0.042, 0.022, 16]} />
              {mat('#9aa1ab', 0.3)}
            </mesh>
            <mesh position={[side * 0.04, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.022, 0.022, 0.01, 16]} />
              <meshStandardMaterial color="#1b1d24" metalness={0.4} roughness={0.25} />
            </mesh>
          </group>
        )}
        <mesh position={[0, -0.285, 0]} scale={[1, 1.1, 0.8]} castShadow>
          <sphereGeometry args={[0.042, 14, 12]} />
          {mat(SKIN, 0.6)}
        </mesh>
      </group>
    </group>
  )
}

function Chair() {
  return (
    <group>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.3, 0.04, 5]} />
        {mat(C.ink)}
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
      </mesh>
      <RoundedBox args={[0.5, 0.08, 0.48]} radius={0.04} position={[0, SEAT - 0.04, 0]} castShadow>
        {mat(C.slate)}
      </RoundedBox>
      <RoundedBox args={[0.46, 0.4, 0.07]} radius={0.04} position={[0, SEAT + 0.27, 0.27]} rotation={[0.12, 0, 0]} castShadow>
        {mat(C.slate)}
      </RoundedBox>
    </group>
  )
}
