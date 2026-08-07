export type MiscItem = {
  title: string
  blurb: string
  tags: string[]
}

export const miscItems: MiscItem[] = [
  {
    title: 'InvestIQ (stockApp)',
    blurb:
      'My ET Money subscription lapsed, so I built the thing myself: multi-factor stock scoring, ML predictions, portfolio optimization, SIP planning, swing signals, and an automated trading engine with 6-layer risk validation. Dockerized PWA.',
    tags: ['Python', 'React', 'ML', 'trading'],
  },
  {
    title: 'graphify',
    blurb:
      'Knowledge-graph tooling for codebases: god nodes, community detection, query/path/explain. Indexed and adopted across 40+ service repos.',
    tags: ['DevEx', 'knowledge graphs', 'CLI'],
  },
  {
    title: 'HTTP server hardening',
    blurb:
      'A shared Go httpserver package bringing SIGTERM graceful shutdown and sane timeouts to a fleet of microservices, piloted and rolled out service by service.',
    tags: ['Go', 'reliability', 'platform'],
  },
  {
    title: 'On-call triage stack',
    blurb:
      'Incident tooling that pulls alerts, traces, and logs into one triage flow, plus automated daily alert summaries per service.',
    tags: ['observability', 'incident response'],
  },
]
