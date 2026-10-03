'use client'

import { useRef, useState } from 'react'
import { useFrame, type ThreeElements, type ThreeEvent } from '@react-three/fiber'
import type { Group } from 'three'
import { blip } from '@/components/room/sound'
import { discover, setState } from '@/components/room/store'

export const C = {
  accent: '#ff6a3d',
  green: '#2f9e44',
  yellow: '#ffd43b',
  white: '#f3ece2',
  wood: '#b07a4f',
  woodDark: '#7a4e2f',
  terracotta: '#c8643b',
  teal: '#2f6f73',
  slate: '#3b4256',
  ink: '#1f2230',
  skin: '#b97a50',
  hair: '#1d1a17',
}

/** Pixels moved during the current pointer press; clicks after a drag are ignored. */
export const drag = { moved: 0 }

export function hourNow() {
  return new Date().getHours() + new Date().getMinutes() / 60
}

export function isNight(h = hourNow()) {
  return h >= 19 || h < 6
}

/** Hover cursor, a squash-and-stretch boop on click, and a hover lift. */
export function Interactive({
  name,
  onClick,
  children,
  hoverLift = 0.03,
  ...props
}: {
  name: string
  onClick?: (e: ThreeEvent<MouseEvent>) => void
  children: React.ReactNode
  hoverLift?: number
} & ThreeElements['group']) {
  const ref = useRef<Group>(null)
  const inner = useRef<Group>(null)
  const [hover, setHover] = useState(false)
  const boop = useRef(0)

  useFrame((_, dt) => {
    const g = inner.current
    if (!g) return
    boop.current = Math.max(0, boop.current - dt * 3.2)
    // damped wobble: a quick squash then settle
    const b = Math.sin(boop.current * Math.PI * 3) * boop.current * 0.14
    const target = hover ? hoverLift : 0
    g.position.y += (target - g.position.y) * Math.min(1, dt * 12)
    g.scale.set(1 - b * 0.6, 1 + b, 1 - b * 0.6)
  })

  return (
    <group
      ref={ref}
      {...props}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHover(true)
        setState({ hovered: name })
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHover(false)
        setState((s) => (s.hovered === name ? { hovered: null } : {}))
        document.body.style.cursor = ''
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (drag.moved > 6) return
        boop.current = 1
        blip(480 + Math.random() * 200)
        discover(name)
        onClick?.(e)
      }}
    >
      <group ref={inner}>{children}</group>
    </group>
  )
}
