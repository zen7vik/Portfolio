'use client'

import type { CaseDiagram } from '@/components/case/diagramTypes'

const NODE_H = 56

function center(n: { x: number; y: number; w: number }) {
  return { cx: n.x + n.w / 2, cy: n.y + NODE_H / 2 }
}

export default function SystemDiagram({ diagram, active }: { diagram: CaseDiagram; active: string[] }) {
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]))
  const isActive = (id: string) => active.includes(id)
  const ease = 'stroke 0.5s, fill 0.5s, opacity 0.5s'

  return (
    <svg viewBox="0 0 570 400" className="h-auto w-full" role="img" aria-label="System architecture diagram">
      {diagram.edges.map((e) => {
        const id = e.id ?? `${e.from}-${e.to}`
        const a = byId.get(e.from)
        const b = byId.get(e.to)
        if (!a || !b) return null
        const ca = center(a)
        const cb = center(b)
        const on = isActive(id)
        return (
          <line
            key={id}
            x1={ca.cx}
            y1={ca.cy}
            x2={cb.cx}
            y2={cb.cy}
            strokeWidth={on ? 2 : 1}
            strokeDasharray={on ? '6 6' : undefined}
            style={{
              stroke: on ? 'var(--accent)' : 'var(--line)',
              transition: ease,
              animation: on ? 'diagram-flow 0.9s linear infinite' : undefined,
            }}
          />
        )
      })}
      {diagram.nodes.map((n) => {
        const on = isActive(n.id)
        return (
          <g key={n.id}>
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={NODE_H}
              rx={10}
              strokeWidth={on ? 1.5 : 1}
              style={{ fill: 'var(--bg)', stroke: on ? 'var(--accent)' : 'var(--line)', transition: ease }}
            />
            <text
              x={n.x + n.w / 2}
              y={n.y + 24}
              textAnchor="middle"
              fontSize={13}
              fontWeight={600}
              style={{
                fill: on || !active.length ? 'var(--fg)' : 'var(--muted)',
                fontFamily: 'var(--font-sans)',
                transition: ease,
              }}
            >
              {n.label}
            </text>
            {n.sub && (
              <text
                x={n.x + n.w / 2}
                y={n.y + 42}
                textAnchor="middle"
                fontSize={10.5}
                style={{ fill: 'var(--muted)', fontFamily: 'var(--font-mono)', opacity: on || !active.length ? 1 : 0.6 }}
              >
                {n.sub}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
