'use client'

import { useSyncExternalStore } from 'react'

export type Focus = 'room' | 'monitor' | 'shelf' | 'board'

export type BubbleLink = { label: string; href: string; external?: boolean; read?: { kind: 'case' | 'post'; id: string } }
export type Bubble = { id: string; anchor: string; text: string; until: number; link?: BubbleLink }

type State = {
  focus: Focus
  bubbles: Bubble[]
  lampOn: boolean
  sound: boolean
  hovered: string | null
  rackBroken: boolean
  openApp: string | null
  ready: boolean
  found: string[]
  night: boolean
}

let state: State = {
  focus: 'room',
  bubbles: [],
  lampOn: true,
  sound: false,
  hovered: null,
  rackBroken: false,
  openApp: null,
  ready: false,
  found: [],
  night: (() => {
    const h = new Date().getHours()
    return h >= 19 || h < 6
  })(),
}

const listeners = new Set<() => void>()

export function getState() {
  return state
}

export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  const next = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useRoom<T>(select: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(state))
}

/** Show a speech bubble above a named anchor for a few seconds. */
export function say(anchor: string, text: string, ms = 4200, link?: BubbleLink) {
  const id = `${anchor}-${Date.now()}`
  setState((s) => ({
    // one voice at a time: a new line replaces whatever was being said
    bubbles: [{ id, anchor, text, until: Date.now() + ms, link }],
  }))
  setTimeout(() => setState((s) => ({ bubbles: s.bubbles.filter((b) => b.id !== id) })), ms)
}

export const FINDABLE = [
  'avatar',
  'monitor',
  'cat',
  'lamp',
  'chai',
  'pager',
  'laptop',
  'book',
  'note',
  'clock',
  'rack',
  'gopher',
  'auto',
  'mochi',
  'heimdall',
  'kudos',
] as const

export function discover(name: string) {
  if (!(FINDABLE as readonly string[]).includes(name)) return
  setState((s) => (s.found.includes(name) ? {} : { found: [...s.found, name] }))
}
