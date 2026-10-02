'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { C } from '@/components/room/kit'

const S = 2.6 // half room size

export function Shell({ night }: { night: boolean }) {
  const planks = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        z: -S + 0.26 + i * 0.52,
        tint: i % 3 === 0 ? '#a8713f' : i % 3 === 1 ? '#b57f4f' : '#9f6a3c',
      })),
    [],
  )

  return (
    <group>
      {/* floor slab */}
      <RoundedBox args={[S * 2 + 0.2, 0.3, S * 2 + 0.2]} radius={0.06} position={[0.05, -0.15, 0.05]} receiveShadow>
        <meshStandardMaterial color="#e9dccb" roughness={0.9} />
      </RoundedBox>
      {planks.map((p, i) => (
        <mesh key={i} position={[0.05, 0.005, p.z + 0.05]} receiveShadow>
          <boxGeometry args={[S * 2 + 0.05, 0.01, 0.5]} />
          <meshStandardMaterial color={p.tint} roughness={0.85} />
        </mesh>
      ))}

      {/* back wall */}
      <RoundedBox args={[S * 2 + 0.2, 3.2, 0.2]} radius={0.05} position={[0.05, 1.6, -S - 0.05]} receiveShadow castShadow>
        <meshStandardMaterial color={C.teal} roughness={0.95} />
      </RoundedBox>
      {/* skirting */}
      <mesh position={[0.05, 0.06, -S + 0.06]}>
        <boxGeometry args={[S * 2, 0.12, 0.03]} />
        <meshStandardMaterial color={C.white} />
      </mesh>

      {/* left wall with a window hole, built from four pieces */}
      <group position={[-S - 0.05, 0, 0.05]}>
        <WallPiece y={1.6} z={-1.85} h={3.2} w={1.5} />
        <WallPiece y={1.6} z={1.75} h={3.2} w={1.7} />
        <WallPiece y={0.5} z={-0.1} h={1.0} w={2.0} />
        <WallPiece y={2.85} z={-0.1} h={0.7} w={2.0} />
        <mesh position={[0.07, 0.06, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[S * 2, 0.12, 0.03]} />
          <meshStandardMaterial color={C.white} />
        </mesh>
        <Window night={night} />
      </group>

      {/* rug */}
      <mesh position={[0.3, 0.02, 0.4]} rotation={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[1.25, 1.25, 0.02, 40]} />
        <meshStandardMaterial color={C.terracotta} roughness={1} />
      </mesh>
      <mesh position={[0.3, 0.032, 0.4]} rotation={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[0.95, 0.95, 0.005, 40]} />
        <meshStandardMaterial color="#e7a26c" roughness={1} />
      </mesh>
      <mesh position={[0.3, 0.036, 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[0.55, 0.62, 40]} />
        <meshStandardMaterial color={C.terracotta} roughness={1} />
      </mesh>
      <mesh position={[0.3, 0.036, 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.22, 6]} />
        <meshStandardMaterial color={C.teal} roughness={1} />
      </mesh>
    </group>
  )
}

function WallPiece({ y, z, h, w }: { y: number; z: number; h: number; w: number }) {
  return (
    <mesh position={[0, y, z]} receiveShadow castShadow>
      <boxGeometry args={[0.2, h, w]} />
      <meshStandardMaterial color={C.white} roughness={0.95} />
    </mesh>
  )
}

function Window({ night }: { night: boolean }) {
  const stars = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const pts: number[] = []
    for (let i = 0; i < 70; i++) pts.push(-0.6 - Math.random() * 0.3, 1.5 + Math.random() * 1.0, -1.0 + Math.random() * 1.8)
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return g
  }, [])
  const starMat = useRef<THREE.PointsMaterial>(null)
  useFrame(({ clock }) => {
    if (starMat.current) starMat.current.opacity = 0.6 + Math.sin(clock.elapsedTime * 1.7) * 0.25
  })

  const skyTop = night ? '#141a2e' : '#7cc4ea'
  const skyBottom = night ? '#3a3157' : '#f6d6a8'

  return (
    <group position={[0, 0, -0.1]}>
      {/* frame */}
      <mesh position={[0.08, 1.0, 0]}>
        <boxGeometry args={[0.14, 0.08, 1.95]} />
        <meshStandardMaterial color={C.white} />
      </mesh>
      <mesh position={[0.02, 1.85, 0]}>
        <boxGeometry args={[0.06, 1.7, 0.05]} />
        <meshStandardMaterial color={C.white} />
      </mesh>
      {/* sky backdrop outside */}
      <mesh position={[-0.95, 1.75, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.6, 1.7]} />
        <shaderMaterial
          uniforms={{ top: { value: new THREE.Color(skyTop) }, bottom: { value: new THREE.Color(skyBottom) } }}
          vertexShader="varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }"
          fragmentShader="uniform vec3 top; uniform vec3 bottom; varying vec2 vUv; void main(){ gl_FragColor = vec4(mix(bottom, top, smoothstep(0.2, 0.9, vUv.y)), 1.0); }"
        />
      </mesh>
      {night ? (
        <>
          <points geometry={stars}>
            <pointsMaterial ref={starMat} size={0.035} color="#fff6d8" transparent />
          </points>
          <mesh position={[-0.85, 2.3, 0.45]}>
            <sphereGeometry args={[0.13, 20, 20]} />
            <meshBasicMaterial color="#fff1c9" />
          </mesh>
        </>
      ) : (
        <mesh position={[-0.85, 2.3, 0.5]}>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshBasicMaterial color="#fff3c4" />
        </mesh>
      )}
      {/* a tiny Delhi skyline: blocks, a dome and a minaret */}
      <group position={[-0.75, 1.0, 0]}>
        {[
          [-0.8, 0.5, 0.35],
          [-0.35, 0.8, 0.3],
          [0.1, 0.45, 0.4],
          [0.55, 0.65, 0.3],
          [0.85, 0.35, 0.3],
        ].map(([z, h, w], i) => (
          <mesh key={i} position={[0, h / 2, z]}>
            <boxGeometry args={[0.1, h, w]} />
            <meshBasicMaterial color={night ? '#232846' : '#c9a98a'} />
          </mesh>
        ))}
        <mesh position={[0, 0.62, 0.1]}>
          <sphereGeometry args={[0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color={night ? '#2b3155' : '#d7b896'} />
        </mesh>
        <mesh position={[0, 0.7, -0.6]}>
          <cylinderGeometry args={[0.035, 0.05, 1.4, 8]} />
          <meshBasicMaterial color={night ? '#2b3155' : '#d7b896'} />
        </mesh>
        {night &&
          [
            [-0.8, 0.3],
            [-0.35, 0.55],
            [-0.3, 0.25],
            [0.1, 0.3],
            [0.55, 0.4],
          ].map(([z, y], i) => (
            <mesh key={`w${i}`} position={[0.06, y, z]}>
              <boxGeometry args={[0.01, 0.05, 0.05]} />
              <meshBasicMaterial color="#ffcf7a" />
            </mesh>
          ))}
      </group>
    </group>
  )
}
