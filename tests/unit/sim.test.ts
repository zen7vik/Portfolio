import { describe, expect, it } from 'vitest'
import { BOOT_MS, DOWN_MS, createSim } from '@/components/play/sim'

function run(sim: ReturnType<typeof createSim>, from: number, ms: number, selfHeal: boolean) {
  let t = from
  for (; t < from + ms; t += 16) sim.step(t, 16, { rate: 20, selfHeal })
  return t
}

describe('playground simulation', () => {
  it('serves everything when all nodes are up', () => {
    const sim = createSim()
    run(sim, 0, 8000, true)
    expect(sim.stats.served).toBeGreaterThan(50)
    expect(sim.stats.dropped).toBe(0)
  })

  it('retries around one dead worker without dropping', () => {
    const sim = createSim()
    let t = run(sim, 0, 3000, false)
    sim.kill('wk-2', t)
    t = run(sim, t, 6000, false)
    expect(sim.stats.retried).toBeGreaterThan(0)
    expect(sim.stats.dropped).toBe(0)
  })

  it('drops requests once a whole tier is down and healing is off', () => {
    const sim = createSim()
    let t = run(sim, 0, 2000, false)
    for (const id of ['wk-1', 'wk-2', 'wk-3']) sim.kill(id, t)
    t = run(sim, t, 5000, false)
    expect(sim.stats.dropped).toBeGreaterThan(0)
    expect(sim.nodes.filter((n) => n.layer === 2).every((n) => n.state === 'down')).toBe(true)
  })

  it('heals dead nodes when healing is on', () => {
    const sim = createSim()
    sim.kill('db-p', 0)
    run(sim, 0, DOWN_MS + BOOT_MS + 200, true)
    expect(sim.nodes.find((n) => n.id === 'db-p')?.state).toBe('up')
  })

  it('users node cannot be killed', () => {
    const sim = createSim()
    sim.kill('users', 0)
    expect(sim.nodes[0].state).toBe('up')
  })
})
