// Pure simulation for the hero playground: requests flow left to right
// through redundant tiers, retry around dead nodes, and drop only when a
// whole tier is gone for longer than the buffer timeout.

export type NodeState = 'up' | 'down' | 'booting'

export type SimNode = {
  id: string
  label: string
  layer: number
  x: number
  y: number
  state: NodeState
  since: number
  load: number
  hits: number
  killable: boolean
}

export type Packet = {
  id: number
  from: SimNode
  to: SimNode
  t: number
  speed: number
  retried: boolean
  waiting: number
  done: boolean
}

export type Burst = { x: number; y: number; t: number; kind: 'drop' | 'ok' | 'kill' }

export type Stats = { served: number; dropped: number; retried: number }

export const DOWN_MS = 3200
export const BOOT_MS = 1100
const BUFFER_MS = 1500

const LAYOUT: Omit<SimNode, 'state' | 'since' | 'load' | 'hits'>[] = [
  { id: 'users', label: 'users', layer: 0, x: 0.07, y: 0.5, killable: false },
  { id: 'gw-a', label: 'gateway a', layer: 1, x: 0.31, y: 0.3, killable: true },
  { id: 'gw-b', label: 'gateway b', layer: 1, x: 0.31, y: 0.7, killable: true },
  { id: 'wk-1', label: 'worker 1', layer: 2, x: 0.6, y: 0.16, killable: true },
  { id: 'wk-2', label: 'worker 2', layer: 2, x: 0.6, y: 0.5, killable: true },
  { id: 'wk-3', label: 'worker 3', layer: 2, x: 0.6, y: 0.84, killable: true },
  { id: 'db-p', label: 'db primary', layer: 3, x: 0.88, y: 0.33, killable: true },
  { id: 'db-r', label: 'db replica', layer: 3, x: 0.88, y: 0.67, killable: true },
]

export const LAST_LAYER = 3

export function createSim() {
  const nodes: SimNode[] = LAYOUT.map((n) => ({ ...n, state: 'up', since: 0, load: 0, hits: 0 }))
  const packets: Packet[] = []
  const bursts: Burst[] = []
  const stats: Stats = { served: 0, dropped: 0, retried: 0 }
  let nextId = 0
  let spawnAcc = 0

  const layer = (l: number) => nodes.filter((n) => n.layer === l)
  const healthy = (l: number) => layer(l).filter((n) => n.state === 'up')

  function pick(l: number): SimNode | null {
    const options = healthy(l)
    if (!options.length) return null
    // least in-flight load, ties broken randomly
    const min = Math.min(...options.map((n) => n.load))
    const best = options.filter((n) => n.load <= min + 1)
    return best[Math.floor(Math.random() * best.length)]
  }

  function launch(from: SimNode, retried = false): Packet | null {
    const to = pick(from.layer + 1)
    const p: Packet = {
      id: nextId++,
      from,
      to: to ?? from,
      t: to ? 0 : 1,
      speed: 0.0011 + Math.random() * 0.0005,
      retried,
      waiting: to ? 0 : 1,
      done: false,
    }
    if (to) to.load++
    packets.push(p)
    return p
  }

  function kill(id: string, now: number) {
    const n = nodes.find((x) => x.id === id)
    if (!n || !n.killable) return
    if (n.state === 'up') {
      n.state = 'down'
      n.since = now
      bursts.push({ x: n.x, y: n.y, t: now, kind: 'kill' })
    } else if (n.state === 'down') {
      n.state = 'booting'
      n.since = now
    }
  }

  function step(now: number, dt: number, opts: { rate: number; selfHeal: boolean }) {
    for (const n of nodes) {
      if (n.state === 'down' && opts.selfHeal && now - n.since > DOWN_MS) {
        n.state = 'booting'
        n.since = now
      } else if (n.state === 'booting' && now - n.since > BOOT_MS) {
        n.state = 'up'
        n.since = now
      }
    }

    spawnAcc += (dt / 1000) * opts.rate
    const users = nodes[0]
    while (spawnAcc >= 1) {
      spawnAcc -= 1
      launch(users)
    }

    for (const p of packets) {
      if (p.done) continue

      // parked at a node because the next tier had no healthy member
      if (p.waiting > 0) {
        p.waiting += dt
        if (p.from.state !== 'up') {
          p.done = true
          stats.dropped++
          bursts.push({ x: p.from.x, y: p.from.y, t: now, kind: 'drop' })
          continue
        }
        const to = pick(p.from.layer + 1)
        if (to) {
          p.to = to
          to.load++
          p.t = 0
          p.waiting = 0
        } else if (p.waiting > BUFFER_MS) {
          p.done = true
          stats.dropped++
          bursts.push({ x: p.from.x, y: p.from.y, t: now, kind: 'drop' })
        }
        continue
      }

      p.t += p.speed * dt
      if (p.t < 1) continue

      const at = p.to
      at.load = Math.max(0, at.load - 1)
      if (at.state !== 'up') {
        // target died in flight: go back to the sender and pick again
        stats.retried++
        p.done = true
        launch(p.from, true)
        continue
      }

      at.hits++
      if (at.layer === LAST_LAYER) {
        p.done = true
        stats.served++
        if (Math.random() < 0.08) bursts.push({ x: at.x, y: at.y, t: now, kind: 'ok' })
        continue
      }
      p.done = true
      launch(at, p.retried)
    }

    // compact finished packets and old bursts
    for (let i = packets.length - 1; i >= 0; i--) if (packets[i].done) packets.splice(i, 1)
    for (let i = bursts.length - 1; i >= 0; i--) if (now - bursts[i].t > 900) bursts.splice(i, 1)
  }

  function reset() {
    for (const n of nodes) {
      n.state = 'up'
      n.load = 0
      n.hits = 0
    }
    packets.length = 0
    bursts.length = 0
    stats.served = 0
    stats.dropped = 0
    stats.retried = 0
  }

  const edges: [SimNode, SimNode][] = []
  for (let l = 0; l < LAST_LAYER; l++) for (const a of layer(l)) for (const b of layer(l + 1)) edges.push([a, b])

  return { nodes, packets, bursts, stats, edges, step, kill, reset }
}

export type Sim = ReturnType<typeof createSim>
