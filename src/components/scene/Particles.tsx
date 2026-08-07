'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'
import { getFormation, type Formation } from '@/components/scene/formations'
import { getScene, subscribeScene } from '@/components/scene/sceneStore'

const STAGGER = 0.35

const vertexShader = /* glsl */ `
  attribute vec3 aFrom;
  attribute vec3 aTarget;
  attribute float aRand;
  uniform float uTime;
  uniform float uMorph;
  uniform float uBurst;
  uniform float uIntensity;
  uniform vec3 uPointer;
  uniform float uSize;
  varying float vRand;

  void main() {
    vRand = aRand;
    float stagger = ${STAGGER};
    float p = clamp((uMorph * (1.0 + stagger) - aRand * stagger), 0.0, 1.0);
    p = p * p * (3.0 - 2.0 * p); // smoothstep ease per particle
    vec3 pos = mix(aFrom, aTarget, p);

    // ambient drift, cheap trig noise
    float t = uTime * 0.35;
    pos.x += sin(t + pos.y * 1.7 + aRand * 6.28) * 0.05 * uIntensity;
    pos.y += cos(t * 1.3 + pos.x * 1.4 + aRand * 6.28) * 0.05 * uIntensity;
    pos.z += sin(t * 0.8 + pos.x + pos.y) * 0.04 * uIntensity;

    // pointer repulsion
    vec3 toPointer = pos - uPointer;
    float d = length(toPointer.xy);
    float force = smoothstep(1.4, 0.0, d);
    pos.xy += normalize(toPointer.xy + 0.0001) * force * 0.7;

    // burst impulse outward from origin
    pos += normalize(pos + 0.0001) * uBurst * (0.6 + aRand * 1.2);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    float depth = max(-mv.z, 2.0);
    gl_PointSize = uSize * (7.0 / depth) * (0.6 + aRand * 0.8);
    gl_Position = projectionMatrix * mv;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColBase;
  uniform vec3 uAccent;
  uniform float uIntensity;
  varying float vRand;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv);
    if (r > 0.5) discard;
    float alpha = smoothstep(0.5, 0.05, r) * (0.55 + 0.45 * vRand);
    vec3 col = mix(uColBase, uAccent, vRand * vRand);
    float dim = clamp(0.12 + 0.88 * uIntensity, 0.0, 1.3);
    gl_FragColor = vec4(col * (0.85 + 0.3 * uIntensity), alpha * 0.35 * dim);
  }
`

export default function Particles({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null)
  const { gl } = useThree()
  const morphState = useRef({ value: 0 })
  const pointerTarget = useRef(new THREE.Vector3(99, 99, 0))
  const burst = useRef(0)

  const { geometry, material, uniforms } = useMemo(() => {
    const from = getFormation('ambient', count)
    // intro: start from a wide, mostly-flat shell so the name assembles out of chaos
    for (let i = 0; i < count; i++) {
      from[i * 3] *= 2.2
      from[i * 3 + 1] *= 2.2
      from[i * 3 + 2] *= 1.1
    }
    const target = getFormation(getScene().formation, count)
    const rand = new Float32Array(count)
    for (let i = 0; i < count; i++) rand[i] = Math.random()

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(from.slice(), 3))
    geometry.setAttribute('aFrom', new THREE.BufferAttribute(from, 3))
    geometry.setAttribute('aTarget', new THREE.BufferAttribute(target, 3))
    geometry.setAttribute('aRand', new THREE.BufferAttribute(rand, 1))

    const initial = getScene()
    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uBurst: { value: 0 },
      uIntensity: { value: initial.intensity },
      uPointer: { value: new THREE.Vector3(99, 99, 0) },
      uSize: { value: window.innerWidth < 768 ? 5.5 : 9 },
      uColBase: { value: new THREE.Color('#e8e8ea') },
      uAccent: { value: new THREE.Color(initial.accent) },
    }

    // Built imperatively so material.uniforms IS this object (R3F's
    // <shaderMaterial uniforms={...}> clones it, detaching our tweens).
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })

    return { geometry, material, uniforms }
  }, [count])

  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  // intro assemble
  useEffect(() => {
    morphState.current.value = 0
    const tween = gsap.to(morphState.current, {
      value: 1,
      duration: 2.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        uniforms.uMorph.value = morphState.current.value
      },
    })
    // re-sample the name once webfonts are ready so glyphs are crisp
    document.fonts?.ready.then(() => {
      if (getScene().formation === 'name') {
        const fresh = getFormation('name', count)
        ;(geometry.getAttribute('aTarget') as THREE.BufferAttribute).copyArray(fresh)
        geometry.getAttribute('aTarget').needsUpdate = true
      }
    })
    return () => {
      tween.kill()
    }
  }, [count, geometry, uniforms])

  // react to scene store
  useEffect(() => {
    let currentFormation: Formation = getScene().formation
    const unsub = subscribeScene((s) => {
      if (s.formation !== currentFormation) {
        currentFormation = s.formation
        const fromAttr = geometry.getAttribute('aFrom') as THREE.BufferAttribute
        const targetAttr = geometry.getAttribute('aTarget') as THREE.BufferAttribute
        const fromArr = fromAttr.array as Float32Array
        const targetArr = targetAttr.array as Float32Array
        // bake current visual position into aFrom (approximate per-particle progress)
        const rand = (geometry.getAttribute('aRand') as THREE.BufferAttribute).array as Float32Array
        const m = uniforms.uMorph.value
        for (let i = 0; i < rand.length; i++) {
          let p = Math.min(1, Math.max(0, m * (1 + STAGGER) - rand[i] * STAGGER))
          p = p * p * (3 - 2 * p)
          const j = i * 3
          fromArr[j] = fromArr[j] + (targetArr[j] - fromArr[j]) * p
          fromArr[j + 1] = fromArr[j + 1] + (targetArr[j + 1] - fromArr[j + 1]) * p
          fromArr[j + 2] = fromArr[j + 2] + (targetArr[j + 2] - fromArr[j + 2]) * p
        }
        targetAttr.copyArray(getFormation(s.formation, rand.length))
        fromAttr.needsUpdate = true
        targetAttr.needsUpdate = true
        uniforms.uMorph.value = 0
        morphState.current.value = 0
        gsap.to(morphState.current, {
          value: 1,
          duration: 1.6,
          ease: 'power3.inOut',
          overwrite: true,
          onUpdate: () => {
            uniforms.uMorph.value = morphState.current.value
          },
        })
      }
      gsap.to(uniforms.uIntensity, { value: s.intensity, duration: 0.8, overwrite: 'auto' })
      const accent = new THREE.Color(s.accent)
      gsap.to(uniforms.uAccent.value, { r: accent.r, g: accent.g, b: accent.b, duration: 1.2, overwrite: 'auto' })
      if (s.burst > 0) burst.current = s.burst
    })
    return unsub
  }, [geometry, uniforms])

  // pointer tracking in world space (z=0 plane, camera at z=8)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      // unprojection for fov 50 at z=0: half-height = 8 * tan(25deg)
      const halfH = 8 * Math.tan((25 * Math.PI) / 180)
      const halfW = halfH * (window.innerWidth / window.innerHeight)
      pointerTarget.current.set(x * halfW, y * halfH, 0)
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [gl])

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
    uniforms.uPointer.value.lerp(pointerTarget.current, 0.08)
    burst.current *= 0.92
    uniforms.uBurst.value = burst.current > 0.005 ? burst.current : 0
    if (process.env.NODE_ENV !== 'production') {
      ;(window as unknown as Record<string, unknown>).__scene = { uMorph: uniforms.uMorph.value }
    }
  })

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
}
