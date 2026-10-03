'use client'

import { openReader } from '@/components/reader/readerStore'

const WORLDS = new Set(['/', '/ride'])

/** Inside the room or the ride world, open case studies and posts in the reader instead of leaving the world. */
export function openInWorld(href: string): boolean {
  if (typeof window === 'undefined' || !WORLDS.has(window.location.pathname)) return false
  const m = href.match(/^\/(work|writing)\/([^/?#]+)$/)
  if (!m) return false
  openReader(m[1] === 'work' ? 'case' : 'post', m[2])
  return true
}
