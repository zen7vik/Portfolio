'use client'

import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Particles from '@/components/scene/Particles'

export default function SceneInner({ onFail }: { onFail: () => void }) {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    setCount(window.innerWidth < 768 ? 12000 : 45000)
  }, [])

  if (count === null) return null

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      dpr={[1, 1.75]}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault()
          onFail()
        })
      }}
    >
      <Particles count={count} />
    </Canvas>
  )
}
