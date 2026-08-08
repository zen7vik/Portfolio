import { describe, expect, it } from 'vitest'
import { ambient, helix, lattice, sphere, torus, twin, vortex, wave } from '@/components/scene/formations'

const COUNT = 4096

describe.each([
  ['ambient', ambient],
  ['sphere', sphere],
  ['lattice', lattice],
  ['vortex', vortex],
  ['helix', helix],
  ['wave', wave],
  ['torus', torus],
  ['twin', twin],
] as const)('%s formation', (_name, fn) => {
  const arr = fn(COUNT)

  it('has count*3 finite values', () => {
    expect(arr.length).toBe(COUNT * 3)
    expect([...arr].every(Number.isFinite)).toBe(true)
  })

  it('stays within bounds', () => {
    let max = 0
    for (const v of arr) max = Math.max(max, Math.abs(v))
    expect(max).toBeLessThanOrEqual(6)
  })

  it('is not degenerate (points spread out)', () => {
    const xs = new Set<number>()
    for (let i = 0; i < arr.length; i += 3) xs.add(Math.round(arr[i] * 10))
    expect(xs.size).toBeGreaterThan(10)
  })
})
