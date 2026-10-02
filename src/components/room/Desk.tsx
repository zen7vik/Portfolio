'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { C, Interactive } from '@/components/room/kit'
import { buzz } from '@/components/room/sound'
import { say, setState, useRoom } from '@/components/room/store'

export const DESK_Y = 0.76

export function Desk() {
  return (
    <group>
      <RoundedBox args={[2.5, 0.06, 0.92]} radius={0.02} position={[0.2, DESK_Y, -2.05]} castShadow receiveShadow>
        <meshStandardMaterial color={C.wood} roughness={0.75} />
      </RoundedBox>
      {[
        [-0.98, -2.42],
        [1.38, -2.42],
        [-0.98, -1.68],
        [1.38, -1.68],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, DESK_Y / 2, z]} castShadow>
          <boxGeometry args={[0.06, DESK_Y, 0.06]} />
          <meshStandardMaterial color={C.woodDark} />
        </mesh>
      ))}
      {/* drawer unit */}
      <RoundedBox args={[0.5, 0.55, 0.8]} radius={0.02} position={[1.1, 0.3, -2.05]} castShadow receiveShadow>
        <meshStandardMaterial color={C.white} roughness={0.8} />
      </RoundedBox>
      {[0.42, 0.18].map((y) => (
        <mesh key={y} position={[1.1, y, -1.645]}>
          <boxGeometry args={[0.16, 0.025, 0.02]} />
          <meshStandardMaterial color={C.woodDark} />
        </mesh>
      ))}
      <Keyboard />
      <mesh position={[0.62, DESK_Y + 0.045, -1.84]} castShadow>
        <capsuleGeometry args={[0.03, 0.04, 4, 10]} />
        <meshStandardMaterial color={C.ink} />
      </mesh>
      <mesh position={[0.62, DESK_Y + 0.031, -1.84]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.3, 0.24]} />
        <meshStandardMaterial color={C.slate} />
      </mesh>
      <Chair />
    </group>
  )
}

function Keyboard() {
  const keys = useMemo(() => {
    const out: [number, number][] = []
    for (let r = 0; r < 4; r++) for (let c = 0; c < 13; c++) out.push([-0.27 + c * 0.045, -0.06 + r * 0.04])
    return out
  }, [])
  const ref = useRef<THREE.InstancedMesh>(null)
  useEffect(() => {
    const m = new THREE.Matrix4()
    keys.forEach(([x, z], i) => {
      m.setPosition(x, 0, z)
      ref.current?.setMatrixAt(i, m)
    })
    if (ref.current) ref.current.instanceMatrix.needsUpdate = true
  }, [keys])
  return (
    <group position={[0.12, DESK_Y + 0.045, -1.86]}>
      <RoundedBox args={[0.64, 0.025, 0.2]} radius={0.01} castShadow>
        <meshStandardMaterial color="#d9d2c6" />
      </RoundedBox>
      <instancedMesh ref={ref} args={[undefined, undefined, keys.length]} position={[0, 0.02, 0]} castShadow>
        <boxGeometry args={[0.036, 0.014, 0.032]} />
        <meshStandardMaterial color="#fbf7f0" />
      </instancedMesh>
    </group>
  )
}

function Chair() {
  return (
    <group position={[0.15, 0, -1.08]}>
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.3, 0.04, 5]} />
        <meshStandardMaterial color={C.ink} />
      </mesh>
      <mesh position={[0, 0.27, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.4, 8]} />
        <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
      </mesh>
      <RoundedBox args={[0.5, 0.08, 0.48]} radius={0.04} position={[0, 0.5, 0]} castShadow>
        <meshStandardMaterial color={C.slate} />
      </RoundedBox>
      <RoundedBox args={[0.48, 0.62, 0.08]} radius={0.04} position={[0, 0.85, 0.26]} rotation={[0.1, 0, 0]} castShadow>
        <meshStandardMaterial color={C.slate} />
      </RoundedBox>
    </group>
  )
}

export function Lamp() {
  const on = useRoom((s) => s.lampOn)
  const light = useRef<THREE.SpotLight>(null)
  const target = useMemo(() => new THREE.Object3D(), [])
  useEffect(() => {
    target.position.set(-0.3, DESK_Y, -1.9)
    if (light.current) light.current.target = target
  }, [target])

  return (
    <group position={[-0.78, DESK_Y + 0.03, -2.3]}>
      <primitive object={target} />
      <Interactive
        name="lamp"
        onClick={() => {
          setState((s) => ({ lampOn: !s.lampOn }))
          say('lamp', on ? 'Lights out. Dramatic.' : 'Better. I can see my bugs again.', 2600)
        }}
      >
        <mesh castShadow>
          <cylinderGeometry args={[0.11, 0.13, 0.04, 20]} />
          <meshStandardMaterial color={C.ink} />
        </mesh>
        <mesh position={[0.05, 0.2, 0.03]} rotation={[0, 0, -0.3]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, 0.42, 10]} />
          <meshStandardMaterial color={C.accent} />
        </mesh>
        <mesh position={[0.11, 0.4, 0.06]}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial color={C.ink} />
        </mesh>
        <mesh position={[0.2, 0.44, 0.15]} rotation={[0.9, 0, 0.7]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.26, 10]} />
          <meshStandardMaterial color={C.accent} />
        </mesh>
        <group position={[0.29, 0.44, 0.26]} rotation={[-0.45, 0, 0.35]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.05, 0.14, 0.17, 24, 1, true]} />
            <meshStandardMaterial color={C.ink} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.13, 24]} />
            <meshStandardMaterial color="#fff2c4" emissive="#ffcf7a" emissiveIntensity={on ? 2.5 : 0} side={THREE.DoubleSide} />
          </mesh>
        </group>
      </Interactive>
      <spotLight
        ref={light}
        position={[0.29, 0.38, 0.28]}
        angle={0.8}
        penumbra={0.7}
        intensity={on ? 14 : 0}
        distance={3.5}
        color="#ffb86b"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
    </group>
  )
}

export function Chai() {
  const steam = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    steam.current?.children.forEach((c, i) => {
      const t = (clock.elapsedTime * 0.45 + i / 3) % 1
      c.position.y = 0.1 + t * 0.28
      c.position.x = Math.sin(t * 6 + i) * 0.025
      const s = 0.02 + t * 0.03
      c.scale.setScalar(s / 0.02)
      ;((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = Math.sin(t * Math.PI) * 0.35
    })
  })
  return (
    <group position={[-0.42, DESK_Y + 0.03, -1.82]}>
      <Interactive name="chai" onClick={() => say('chai', 'Adrak wali chai. Load-bearing for every incident I have led.', 3600)}>
        <mesh castShadow>
          <cylinderGeometry args={[0.055, 0.045, 0.11, 16]} />
          <meshStandardMaterial color={C.white} />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.005, 16]} />
          <meshStandardMaterial color="#b9844f" />
        </mesh>
        <mesh position={[0.065, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.03, 0.009, 8, 16]} />
          <meshStandardMaterial color={C.white} />
        </mesh>
      </Interactive>
      <group ref={steam}>
        {[0, 1, 2].map((i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

const PAGES = [
  'PAGE: scoring consumer OOM after 10 hours. Root cause: 42-column rows loaded to write a 3-field audit log. Fixed.',
  'PAGE: workflow failure rate 12.3%. Two months later: 3.8%, at twice the volume.',
  'PAGE: cluster migration needs a 1.5h write freeze? Did it with a 1 second flip instead. 0 runs lost.',
  'PAGE: p95 on the risk API is 604 ms. Now 281 ms. You may go back to sleep.',
  'PAGE: 18K control writes became 46M log lines and ran a shared database out of memory four hops away. Traced every hop.',
]

export function Pager() {
  const ref = useRef<THREE.Group>(null)
  const shake = useRef(0)
  const idx = useRef(0)
  const page = () => {
    shake.current = 1.2
    buzz()
    say('pager', PAGES[idx.current % PAGES.length], 5200)
    idx.current++
  }
  useEffect(() => {
    const first = setTimeout(page, 9000)
    const id = setInterval(page, 26000)
    return () => {
      clearTimeout(first)
      clearInterval(id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const screen = useRef<THREE.MeshStandardMaterial>(null)
  useFrame((_, dt) => {
    shake.current = Math.max(0, shake.current - dt)
    if (ref.current) {
      ref.current.rotation.y = -0.3 + Math.sin(shake.current * 60) * 0.06 * shake.current
      ref.current.position.x = 0.92 + Math.sin(shake.current * 80) * 0.006 * shake.current
    }
    if (screen.current) screen.current.emissiveIntensity = shake.current > 0 ? 2.2 : 0.4
  })
  return (
    <group ref={ref} position={[0.92, DESK_Y + 0.04, -1.8]} rotation={[0, -0.3, 0]}>
      <Interactive name="pager" onClick={page}>
        <RoundedBox args={[0.13, 0.018, 0.25]} radius={0.008} castShadow>
          <meshStandardMaterial color={C.ink} />
        </RoundedBox>
        <mesh position={[0, 0.0101, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.11, 0.21]} />
          <meshStandardMaterial ref={screen} color="#1c2238" emissive={C.accent} emissiveIntensity={0.4} />
        </mesh>
      </Interactive>
    </group>
  )
}

/** Second screen running a toy InvestIQ chart: drawn on a canvas texture, scrolling. */
export function Laptop() {
  const { tex, draw } = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 160
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    let price = 80
    const candles: [number, number, number, number][] = []
    for (let i = 0; i < 26; i++) {
      const o = price
      price += (Math.random() - 0.45) * 8
      candles.push([o, price, Math.max(o, price) + Math.random() * 4, Math.min(o, price) - Math.random() * 4])
    }
    const draw = () => {
      const g = canvas.getContext('2d')!
      const o = price
      price += (Math.random() - 0.46) * 8
      price = Math.max(30, Math.min(140, price))
      candles.push([o, price, Math.max(o, price) + Math.random() * 4, Math.min(o, price) - Math.random() * 4])
      candles.shift()
      g.fillStyle = '#10141f'
      g.fillRect(0, 0, 256, 160)
      g.fillStyle = '#7d8597'
      g.font = '12px monospace'
      g.fillText('InvestIQ  NIFTY demo', 10, 18)
      const y = (v: number) => 150 - (v - 20) * 0.95
      candles.forEach(([op, cl, hi, lo], i) => {
        const x = 12 + i * 9.2
        g.strokeStyle = g.fillStyle = cl >= op ? '#3ccf8a' : '#ff5a5a'
        g.beginPath()
        g.moveTo(x + 3, y(hi))
        g.lineTo(x + 3, y(lo))
        g.stroke()
        g.fillRect(x, Math.min(y(op), y(cl)), 6, Math.max(2, Math.abs(y(op) - y(cl))))
      })
      t.needsUpdate = true
    }
    draw()
    return { tex: t, draw }
  }, [])
  useEffect(() => {
    const id = setInterval(draw, 900)
    return () => clearInterval(id)
  }, [draw])

  return (
    <group position={[0.98, DESK_Y + 0.03, -2.2]} rotation={[0, -0.45, 0]}>
      <Interactive
        name="laptop"
        onClick={() =>
          say(
            'laptop',
            'InvestIQ: my own trading app. ML ensemble, sentiment, and a bot where every order passes six risk checks. Built it when my ET Money plan lapsed.',
            5200,
          )
        }
      >
        <RoundedBox args={[0.46, 0.02, 0.32]} radius={0.008} castShadow>
          <meshStandardMaterial color="#c9ccd3" metalness={0.3} roughness={0.4} />
        </RoundedBox>
        <group position={[0, 0.01, -0.16]} rotation={[-0.25, 0, 0]}>
          <RoundedBox args={[0.46, 0.3, 0.015]} radius={0.008} position={[0, 0.15, 0]} castShadow>
            <meshStandardMaterial color="#c9ccd3" metalness={0.3} roughness={0.4} />
          </RoundedBox>
          <mesh position={[0, 0.15, 0.009]}>
            <planeGeometry args={[0.42, 0.26]} />
            <meshStandardMaterial map={tex} emissive="#ffffff" emissiveMap={tex} emissiveIntensity={0.9} toneMapped={false} />
          </mesh>
        </group>
      </Interactive>
    </group>
  )
}
