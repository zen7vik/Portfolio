'use client'

import { useEffect } from 'react'
import type { Formation } from '@/components/scene/formations'
import { setSceneBase } from '@/components/scene/sceneStore'

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
    setSceneBase({ formation, intensity, accent })
  }, [accent, formation, intensity])
  return null
}
