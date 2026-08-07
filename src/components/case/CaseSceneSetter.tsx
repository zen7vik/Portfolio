'use client'

import { useEffect } from 'react'
import { setScene } from '@/components/scene/sceneStore'

export default function CaseSceneSetter({ accent }: { accent: '#7c8cff' | '#58c48f' }) {
  useEffect(() => {
    setScene({ formation: 'ambient', intensity: 0.35, accent })
  }, [accent])
  return null
}
