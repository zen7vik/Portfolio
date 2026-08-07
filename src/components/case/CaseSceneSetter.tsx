'use client'

import { useEffect } from 'react'
import type { Formation } from '@/components/scene/formations'
import { setScene } from '@/components/scene/sceneStore'

export default function CaseSceneSetter({
  accent,
  formation = 'ambient',
  intensity = 0.35,
}: {
  accent: string
  formation?: Formation
  intensity?: number
}) {
  useEffect(() => {
    setScene({ formation, intensity, accent })
  }, [accent, formation, intensity])
  return null
}
