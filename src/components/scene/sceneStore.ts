import type { Formation } from '@/components/scene/formations'

export type SceneState = {
  formation: Formation
  intensity: number
  accent: '#7c8cff' | '#58c48f'
  burst: number
}

const state: SceneState = {
  formation: 'name',
  intensity: 1,
  accent: '#7c8cff',
  burst: 0,
}

const listeners = new Set<(s: SceneState) => void>()

export function setScene(partial: Partial<SceneState>): void {
  Object.assign(state, partial)
  for (const fn of listeners) fn(state)
}

export function getScene(): SceneState {
  return state
}

export function subscribeScene(fn: (s: SceneState) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
