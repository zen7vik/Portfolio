import type { LandmarkId, TimeOfDay } from '@/components/ride/store'

export const C = {
  accent: '#ff6a3d',
  autoGreen: '#2f9e44',
  autoYellow: '#ffd43b',
  ink: '#222222',
  warm: '#f3ece2',
  wood: '#b07a4f',
  woodDark: '#7a4e2f',
  terracotta: '#c8643b',
  teal: '#2f6f73',
  slate: '#3b4256',
  grass: '#a7c957',
  grassDark: '#6a994e',
  sand: '#ead7a8',
  road: '#4a4e5a',
  postRed: '#c92a2a',
}

export const ISLAND_R = 36
export const ROAD_R = 24
export const ROAD_W = 4.6
export const SPAWN: [number, number, number] = [0, 1.2, 13]

export type LandmarkDef = { id: LandmarkId; name: string; angle: number; color: string }

// angle 0 = straight ahead from spawn (negative z), clockwise when seen from above
export const LANDMARKS: LandmarkDef[] = [
  { id: 'tower', name: 'Safe Security', angle: 0, color: C.accent },
  { id: 'library', name: 'The library', angle: 52, color: C.teal },
  { id: 'investiq', name: 'InvestIQ', angle: 105, color: C.autoGreen },
  { id: 'postbox', name: 'Post office', angle: 152, color: C.postRed },
  { id: 'paisabazaar', name: 'Paisabazaar', angle: -100, color: '#1c7ed6' },
  { id: 'nit', name: 'NIT Meghalaya', angle: -50, color: C.grassDark },
]

export function polar(angleDeg: number, r: number): [number, number] {
  const a = (angleDeg * Math.PI) / 180
  return [Math.sin(a) * r, -Math.cos(a) * r]
}

export const SKY: Record<TimeOfDay, { bg: string; fog: string; sun: string; sunI: number; hemiSky: string; hemiGround: string; hemiI: number; water: string; lampsOn: boolean }> = {
  day: { bg: '#a5dcf2', fog: '#bfe6f5', sun: '#fff1d6', sunI: 2.6, hemiSky: '#d7f0ff', hemiGround: '#a7c957', hemiI: 1.1, water: '#4fb6cf', lampsOn: false },
  dusk: { bg: '#f6b27a', fog: '#f3c39a', sun: '#ff9a5c', sunI: 2.1, hemiSky: '#ffd6b0', hemiGround: '#8a6a52', hemiI: 0.9, water: '#3f8fa8', lampsOn: true },
  night: { bg: '#162040', fog: '#1a2546', sun: '#a9bcff', sunI: 1.1, hemiSky: '#6b80c4', hemiGround: '#343a55', hemiI: 1.35, water: '#1b3350', lampsOn: true },
}
