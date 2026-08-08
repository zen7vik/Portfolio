'use client'

import type { CaseDiagram } from '@/components/case/diagramTypes'

const NODE_H = 56

function center(n: { x: number; y: number; w: number }) {
  return { cx: n.x + n.w / 2, cy: n.y + NODE_H / 2 }
}

export default function SystemDiagram({
  diagram,
  active,
  accent,
}: {
  diagram: CaseDiagram
  active: string[]
  accent: string
}) {
  const byId = new Map(diagram.nodes.map((n) => [n.id, n]))
  const isActive = (id: string) => active.includes(id)

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
          <g key={id}>
            <line
              x1={ca.cx}
              y1={ca.cy}
              x2={cb.cx}
              y2={cb.cy}
              stroke={on ? accent : '#3a4258'}
              strokeWidth={on ? 2 : 1}
              strokeDasharray={on ? '6 6' : 'none'}
              opacity={on ? 1 : 0.6}
              style={
                on
                  ? { animation: 'diagram-flow 0.9s linear infinite', transition: 'stroke 0.4s' }
                  : { transition: 'stroke 0.4s' }
              }
            />
          </g>
        )
      })}
      {diagram.nodes.map((n) => {
        const on = isActive(n.id)
        return (
          <g key={n.id} style={{ transition: 'opacity 0.4s' }} opacity={on ? 1 : 0.55}>
            <rect
              x={n.x}
              y={n.y}
              width={n.w}
              height={NODE_H}
              rx={10}
              fill={on ? '#161a28' : '#10131d'}
              stroke={on ? accent : '#3a4258'}
              strokeWidth={on ? 1.75 : 1}
              style={{ transition: 'stroke 0.4s, fill 0.4s', filter: on ? `drop-shadow(0 0 8px ${accent}66)` : 'none' }}
            />
            <text
              x={n.x + n.w / 2}
              y={n.y + 24}
              textAnchor="middle"
              fill={on ? '#e8e8ea' : '#9aa3b8'}
              fontSize={13}
              fontWeight={600}
              fontFamily="var(--font-jetbrains), monospace"
            >
              {n.label}
            </text>
            {n.sub && (
              <text
                x={n.x + n.w / 2}
                y={n.y + 42}
                textAnchor="middle"
                fill="#6b7280"
                fontSize={10}
                fontFamily="var(--font-jetbrains), monospace"
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
