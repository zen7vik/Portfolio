import type { Formation } from '@/components/scene/formations'

export type SceneState = {
  formation: Formation
  intensity: number
  accent: string
  burst: number
}

const state: SceneState = {
  formation: 'name',
  intensity: 1,
  accent: '#7c8cff',
  burst: 0,
}

// the section-level "resting" state; hover effects are transient deviations from this
const base = { formation: 'name' as Formation, intensity: 1, accent: '#7c8cff' }

const listeners = new Set<(s: SceneState) => void>()

function notify() {
  for (const fn of listeners) fn(state)
}

/** Transient change (hover glows, bursts). Does not move the resting state. */
export function setScene(partial: Partial<SceneState>): void {
  Object.assign(state, partial)
  notify()
}

/** Section/page-level change. Updates the resting state hovers return to. */
export function setSceneBase(partial: Partial<Pick<SceneState, 'formation' | 'intensity' | 'accent'>>): void {
  Object.assign(base, partial)
  Object.assign(state, partial)
  notify()
}

/** Return to the current section's resting state (ends a hover).
 *  Only intensity and accent: hovers never change the formation, so
 *  restoring one must never trigger a morph either. */
export function restoreSceneBase(): void {
  state.intensity = base.intensity
  state.accent = base.accent
  notify()
}

export function getScene(): SceneState {
  return state
}

export function subscribeScene(fn: (s: SceneState) => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
