'use client'

import { useSyncExternalStore } from 'react'

export type ReaderTarget = { kind: 'case' | 'post'; id: string } | null

let current: ReaderTarget = null
const listeners = new Set<() => void>()

export function openReader(kind: 'case' | 'post', id: string) {
  current = { kind, id }
  listeners.forEach((l) => l())
}

export function closeReader() {
  current = null
  listeners.forEach((l) => l())
}

/** Worlds check this so keys typed while reading do not drive the auto. */
export function isReaderOpen() {
  return current !== null
}

export function useReaderTarget() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    () => current,
    () => null,
  )
}
