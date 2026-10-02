'use client'

import { useSyncExternalStore } from 'react'

export type LandmarkId = 'tower' | 'paisabazaar' | 'nit' | 'investiq' | 'library' | 'postbox'
export type TimeOfDay = 'day' | 'dusk' | 'night'

export type RideState = {
  ready: boolean
  started: boolean
  active: LandmarkId | null
  chai: string[]
  toast: { id: number; text: string } | null
  sound: boolean
  time: TimeOfDay
  farmDown: boolean
  celebrate: boolean
}

export const CHAI_TOTAL = 6

function initialTime(): TimeOfDay {
  if (typeof window !== 'undefined') {
    const forced = new URLSearchParams(window.location.search).get('t')
    if (forced === 'day' || forced === 'dusk' || forced === 'night') return forced
  }
  const h = new Date().getHours()
  if (h >= 19 || h < 6) return 'night'
  if (h >= 17) return 'dusk'
  return 'day'
}

let state: RideState = {
  ready: false,
  started: false,
  active: null,
  chai: [],
  toast: null,
  sound: false,
  time: 'day',
  farmDown: false,
  celebrate: false,
}

const listeners = new Set<() => void>()

export function getState() {
  return state
}

export function setState(patch: Partial<RideState> | ((s: RideState) => Partial<RideState>)) {
  const next = typeof patch === 'function' ? patch(state) : patch
  state = { ...state, ...next }
  listeners.forEach((l) => l())
}

export function initTime() {
  setState({ time: initialTime() })
}

let toastTimer: ReturnType<typeof setTimeout> | undefined
export function toast(text: string, ms = 3200) {
  clearTimeout(toastTimer)
  setState({ toast: { id: Date.now(), text } })
  toastTimer = setTimeout(() => setState({ toast: null }), ms)
}

export function useRide<T>(select: (s: RideState) => T): T {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => select(state),
    () => select(state),
  )
}

// mutable driving input shared by keyboard, joystick and the vehicle loop
export const controls = {
  forward: 0,
  steer: 0,
  brake: false,
  reset: false,
  honk: false,
  teleport: null as null | { x: number; z: number; yaw: number },
}
export const keys = { up: false, down: false, left: false, right: false }

export function syncKeys() {
  controls.forward = (keys.up ? 1 : 0) - (keys.down ? 1 : 0)
  controls.steer = (keys.left ? 1 : 0) - (keys.right ? 1 : 0)
}

// live auto pose for camera, landmarks and minimap
export const autoPose = { x: 0, y: 0, z: 12, yaw: 0, speed: 0 }

if (typeof window !== 'undefined') {
  ;(window as unknown as { __ride: unknown }).__ride = { autoPose, controls, getState, setState }
}
