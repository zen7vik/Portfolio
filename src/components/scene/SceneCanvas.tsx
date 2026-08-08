'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import StaticHero from '@/components/scene/StaticHero'
import { prefersReducedMotion } from '@/lib/motion'

const SceneInner = dynamic(() => import('@/components/scene/SceneInner'), { ssr: false })

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export default function SceneCanvas() {
  // 'pending' avoids hydration mismatch; decide on the client
  const [mode, setMode] = useState<'pending' | 'scene' | 'static'>('pending')

  useEffect(() => {
    if (prefersReducedMotion() || !webglAvailable()) {
      setMode('static')
      document.documentElement.classList.add('no-scene')
    } else {
      setMode('scene')
    }
  }, [])

  if (mode === 'pending') return <StaticHero />
  if (mode === 'static') return <StaticHero />

  return (
    <div className="pointer-events-none fixed inset-0 scene-fade-in">
      <SceneInner
        onFail={() => {
          setMode('static')
          document.documentElement.classList.add('no-scene')
        }}
      />
    </div>
  )
}
