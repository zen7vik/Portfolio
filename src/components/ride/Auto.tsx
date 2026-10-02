'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { CuboidCollider, RigidBody, useBeforePhysicsStep, type RapierRigidBody } from '@react-three/rapier'
import { isReaderOpen } from '@/components/reader/readerStore'
import { autoPose, controls, getState, setState, toast, useRide } from '@/components/ride/store'
import { sfx } from '@/components/ride/sound'
import { C, SPAWN } from '@/components/ride/world-config'

const MAX_FWD = 13
const MAX_REV = 5
const ACCEL = 15
const BRAKE = 30

const fwd = new THREE.Vector3()
const right = new THREE.Vector3()
const q = new THREE.Quaternion()

function Wheel({ position, wheelRef }: { position: [number, number, number]; wheelRef: (m: THREE.Group | null) => void }) {
  return (
    <group position={position} ref={wheelRef}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.24, 0.24, 0.17, 14]} />
        <meshStandardMaterial color={C.ink} roughness={0.9} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.11, 0.11, 0.19, 8]} />
        <meshStandardMaterial color="#c9c9c9" roughness={0.5} />
      </mesh>
    </group>
  )
}

const PUFFS = 10

export default function Auto() {
  const headlights = useRide((s) => s.time !== 'day')
  const lamp = useRef<THREE.SpotLight>(null)
  const lampTarget = useRef<THREE.Object3D>(null)
  useEffect(() => {
    if (lamp.current && lampTarget.current) lamp.current.target = lampTarget.current
  }, [])
  const body = useRef<RapierRigidBody>(null)
  const shell = useRef<THREE.Group>(null)
  const wheels = useRef<THREE.Group[]>([])
  const frontFork = useRef<THREE.Group>(null)
  const puffs = useRef<THREE.Mesh[]>([])
  const puffLife = useRef<number[]>(Array(PUFFS).fill(1))
  const puffClock = useRef(0)
  const roll = useRef(0)
  const pitch = useRef(0)
  const lastSpeed = useRef(0)
  const wheelSpin = useRef(0)
  const honkCd = useRef(0)
  const glow = useRef<THREE.Group>(null)
  const tail = useRef<THREE.MeshStandardMaterial>(null)

  const reset = () => {
    const b = body.current
    if (!b) return
    b.setTranslation({ x: SPAWN[0], y: SPAWN[1], z: SPAWN[2] }, true)
    b.setLinvel({ x: 0, y: 0, z: 0 }, true)
    b.setAngvel({ x: 0, y: 0, z: 0 }, true)
    b.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true)
  }

  const STEP = 1 / 60
  useBeforePhysicsStep(() => {
    const b = body.current
    if (!b) return
    const dt = STEP

    if (controls.reset) {
      controls.reset = false
      reset()
    }
    if (controls.teleport) {
      const { x, z, yaw } = controls.teleport
      controls.teleport = null
      b.setTranslation({ x, y: 0.4, z }, true)
      b.setLinvel({ x: 0, y: 0, z: 0 }, true)
      b.setRotation(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw), true)
    }

    const t = b.translation()
    if (t.y < -4) {
      sfx.splash()
      toast('Splash. The river wins this round. Back to the road.')
      reset()
      return
    }

    const r = b.rotation()
    q.set(r.x, r.y, r.z, r.w)
    fwd.set(0, 0, -1).applyQuaternion(q)
    fwd.y = 0
    fwd.normalize()
    right.set(-fwd.z, 0, fwd.x)

    const v = b.linvel()
    let vf = v.x * fwd.x + v.z * fwd.z
    let vr = v.x * right.x + v.z * right.z

    const grounded = t.y < 1.6
    // reading an article parks the auto
    const paused = isReaderOpen()
    const forward = paused ? 0 : controls.forward
    const steer = paused ? 0 : controls.steer
    const handbrake = paused || controls.brake
    const target = forward > 0 ? MAX_FWD * forward : forward < 0 ? -MAX_REV : 0
    const braking = paused || (forward < 0 && vf > 0.5) || (forward > 0 && vf < -0.5)
    const rate = braking ? BRAKE : forward === 0 ? 6 : ACCEL
    if (grounded) {
      const dv = THREE.MathUtils.clamp(target - vf, -rate * dt, rate * dt)
      vf += dv
      if (handbrake) vf *= Math.exp(-1.6 * dt)
      // lateral grip: tight normally, loose on handbrake for drifts
      vr *= Math.exp(-(handbrake && !paused ? 1.4 : 9) * dt)
      b.setLinvel({ x: fwd.x * vf + right.x * vr, y: v.y, z: fwd.z * vf + right.z * vr }, true)

      const speedFactor = THREE.MathUtils.clamp(vf / 5, -1, 1)
      const turn = steer * (handbrake ? 3.1 : 2.3) * speedFactor
      b.setAngvel({ x: 0, y: turn, z: 0 }, true)
    }

    autoPose.x = t.x
    autoPose.y = t.y
    autoPose.z = t.z
    autoPose.yaw = Math.atan2(-fwd.x, -fwd.z)
    autoPose.speed = vf
  })

  useFrame((_, rawDt) => {
    const b = body.current
    if (!b) return
    const dt = Math.min(rawDt, 1 / 20)
    const t = b.translation()
    const vf = autoPose.speed
    const lv = b.linvel()
    const r = b.rotation()
    q.set(r.x, r.y, r.z, r.w)
    fwd.set(0, 0, -1).applyQuaternion(q)
    fwd.y = 0
    fwd.normalize()
    right.set(-fwd.z, 0, fwd.x)
    const vr = lv.x * right.x + lv.z * right.z

    if (!getState().started && (controls.forward !== 0 || controls.steer !== 0)) setState({ started: true })

    // body roll into turns, pitch on throttle, bounce on bumps
    const accel = (vf - lastSpeed.current) / Math.max(dt, 1e-3)
    lastSpeed.current = vf
    roll.current = THREE.MathUtils.damp(roll.current, controls.steer * THREE.MathUtils.clamp(Math.abs(vf) / MAX_FWD, 0, 1) * 0.16 + vr * 0.03, 6, dt)
    pitch.current = THREE.MathUtils.damp(pitch.current, THREE.MathUtils.clamp(accel * 0.006, -0.08, 0.08), 5, dt)
    if (shell.current) {
      const bump = Math.sin(performance.now() * 0.025) * 0.012 * Math.min(1, Math.abs(vf) / 4)
      shell.current.rotation.z = roll.current
      shell.current.rotation.x = pitch.current
      shell.current.position.y = bump
    }

    wheelSpin.current -= (vf * dt) / 0.24
    wheels.current.forEach((w) => w && (w.rotation.x = wheelSpin.current))
    if (frontFork.current) frontFork.current.rotation.y = THREE.MathUtils.damp(frontFork.current.rotation.y, controls.steer * 0.45, 10, dt)

    // exhaust puffs, faster when accelerating
    puffClock.current += dt
    const interval = controls.forward !== 0 ? 0.08 : 0.35
    if (puffClock.current > interval) {
      puffClock.current = 0
      const i = puffLife.current.findIndex((l) => l >= 1)
      const m = puffs.current[i]
      if (m) {
        puffLife.current[i] = 0
        m.position.set(t.x - fwd.x * 1.05 + right.x * 0.35, t.y + 0.15, t.z - fwd.z * 1.05 + right.z * 0.35)
        m.userData.drift = { x: -fwd.x * 0.6 + (Math.random() - 0.5) * 0.4, z: -fwd.z * 0.6 + (Math.random() - 0.5) * 0.4 }
      }
    }
    puffs.current.forEach((m, i) => {
      if (!m) return
      const life = (puffLife.current[i] = Math.min(1, puffLife.current[i] + dt * 1.8))
      m.visible = life < 1
      const d = m.userData.drift ?? { x: 0, z: 0 }
      m.position.x += d.x * dt
      m.position.z += d.z * dt
      m.position.y += dt * 1.1
      m.scale.setScalar(0.05 + life * 0.2)
      ;(m.material as THREE.MeshStandardMaterial).opacity = 0.4 * (1 - life) * (1 - life)
    })

    honkCd.current -= dt
    if (controls.honk && honkCd.current <= 0) {
      honkCd.current = 0.6
      sfx.honk()
    }
    controls.honk = false

    if (glow.current) glow.current.visible = getState().celebrate
    if (tail.current) {
      const braking = controls.brake || (controls.forward < 0 && vf > 0.5)
      tail.current.emissiveIntensity = THREE.MathUtils.damp(tail.current.emissiveIntensity, braking ? 2.6 : 0.8, 12, dt)
    }
  })

  return (
    <>
      <RigidBody
        ref={body}
        position={SPAWN}
        colliders={false}
        enabledRotations={[false, true, false]}
        linearDamping={0.3}
        angularDamping={6}
        ccd
        userData={{ name: 'auto' }}
        name="auto"
      >
        <CuboidCollider args={[0.62, 0.5, 1.05]} position={[0, 0.55, 0]} mass={6} friction={0.15} restitution={0.1} />
        <group ref={shell}>
          {/* lower body */}
          <RoundedBox args={[1.2, 0.42, 1.9]} radius={0.12} smoothness={4} position={[0, 0.5, 0.05]} castShadow>
            <meshStandardMaterial color={C.autoGreen} roughness={0.55} />
          </RoundedBox>
          {/* orange stripe */}
          <mesh position={[0, 0.52, 0.05]}>
            <boxGeometry args={[1.23, 0.07, 1.6]} />
            <meshStandardMaterial color={C.accent} roughness={0.6} />
          </mesh>
          {/* nose cowl */}
          <RoundedBox args={[0.78, 0.75, 0.42]} radius={0.16} smoothness={4} position={[0, 0.82, -0.86]} castShadow>
            <meshStandardMaterial color={C.autoGreen} roughness={0.55} />
          </RoundedBox>
          {/* headlight */}
          <mesh position={[0, 0.98, -1.08]}>
            <sphereGeometry args={[0.11, 12, 10]} />
            <meshStandardMaterial color="#fff6d5" emissive="#ffe8a3" emissiveIntensity={1.6} />
          </mesh>
          {/* windshield */}
          <mesh position={[0, 1.32, -0.74]} rotation={[-0.18, 0, 0]}>
            <boxGeometry args={[1.0, 0.55, 0.03]} />
            <meshStandardMaterial color="#bfe3f2" transparent opacity={0.45} roughness={0.1} />
          </mesh>
          {/* seat */}
          <RoundedBox args={[1.0, 0.3, 0.55]} radius={0.08} smoothness={3} position={[0, 0.86, 0.45]} castShadow>
            <meshStandardMaterial color={C.ink} roughness={0.8} />
          </RoundedBox>
          <RoundedBox args={[1.0, 0.5, 0.14]} radius={0.06} smoothness={3} position={[0, 1.12, 0.72]}>
            <meshStandardMaterial color={C.ink} roughness={0.8} />
          </RoundedBox>
          {/* driver seat and handlebar */}
          <RoundedBox args={[0.42, 0.18, 0.36]} radius={0.06} smoothness={3} position={[0, 0.86, -0.32]}>
            <meshStandardMaterial color={C.ink} roughness={0.8} />
          </RoundedBox>
          <mesh position={[0, 1.08, -0.6]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.025, 0.025, 0.6, 6]} />
            <meshStandardMaterial color="#888" metalness={0.4} roughness={0.4} />
          </mesh>
          {/* canopy posts */}
          {[
            [-0.55, -0.62],
            [0.55, -0.62],
            [-0.55, 0.76],
            [0.55, 0.76],
          ].map(([x, z], i) => (
            <mesh key={i} position={[x, 1.2, z]}>
              <cylinderGeometry args={[0.035, 0.035, 0.85, 6]} />
              <meshStandardMaterial color={C.ink} roughness={0.7} />
            </mesh>
          ))}
          {/* yellow canopy */}
          <RoundedBox args={[1.28, 0.16, 1.72]} radius={0.07} smoothness={4} position={[0, 1.66, 0.06]} castShadow>
            <meshStandardMaterial color={C.autoYellow} roughness={0.6} />
          </RoundedBox>
          <RoundedBox args={[1.22, 0.62, 0.08]} radius={0.04} smoothness={3} position={[0, 1.3, 0.82]} castShadow>
            <meshStandardMaterial color={C.ink} roughness={0.8} />
          </RoundedBox>
          {/* side curtains rolled up */}
          {[-0.62, 0.62].map((x) => (
            <mesh key={x} position={[x, 1.52, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 1.4, 8]} />
              <meshStandardMaterial color={C.autoYellow} roughness={0.8} />
            </mesh>
          ))}
          {/* tail lights */}
          <mesh position={[0, 0.55, 1.01]}>
            <boxGeometry args={[1.06, 0.1, 0.03]} />
            <meshStandardMaterial color="#3a1010" />
          </mesh>
          {[-0.45, 0.45].map((x) => (
            <mesh key={x} position={[x, 0.55, 1.02]}>
              <boxGeometry args={[0.16, 0.1, 0.03]} />
              <meshStandardMaterial ref={x < 0 ? tail : undefined} color="#ff4d4d" emissive="#ff3b3b" emissiveIntensity={0.8} />
            </mesh>
          ))}
          {/* number plate */}
          <mesh position={[0, 0.38, 1.01]}>
            <boxGeometry args={[0.42, 0.13, 0.02]} />
            <meshStandardMaterial color="#ffd43b" />
          </mesh>
        </group>
        <group ref={frontFork} position={[0, 0.24, -0.88]}>
          <Wheel position={[0, 0, 0]} wheelRef={(m) => m && (wheels.current[0] = m)} />
        </group>
        <Wheel position={[-0.56, 0.24, 0.55]} wheelRef={(m) => m && (wheels.current[1] = m)} />
        <Wheel position={[0.56, 0.24, 0.55]} wheelRef={(m) => m && (wheels.current[2] = m)} />
        <object3D ref={lampTarget} position={[0, 0, -8]} />
        <spotLight
          ref={lamp}
          position={[0, 1, -1.1]}
          angle={0.55}
          penumbra={0.6}
          distance={16}
          intensity={headlights ? 60 : 0}
          color="#ffe8b0"
        />
        {/* easter egg: underglow after all six chais */}
        <group ref={glow} visible={false}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
            <planeGeometry args={[1.6, 2.4]} />
            <meshBasicMaterial color={C.accent} transparent opacity={0.55} depthWrite={false} />
          </mesh>
          <pointLight color={C.accent} intensity={6} distance={4} position={[0, 0.3, 0]} />
        </group>
      </RigidBody>
      {Array.from({ length: PUFFS }, (_, i) => (
        <mesh key={i} ref={(m) => m && (puffs.current[i] = m)} visible={false}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#ffffff" transparent opacity={0.4} roughness={1} depthWrite={false} />
        </mesh>
      ))}
    </>
  )
}
