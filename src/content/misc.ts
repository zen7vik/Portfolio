export type MiscItem = {
  title: string
  blurb: string
  detail: string
  tags: string[]
  link?: { label: string; href: string }
}

export const miscItems: MiscItem[] = [
  {
    title: 'Tessera',
    blurb: 'Founding a compliance startup for AI agents in export-controlled environments.',
    detail:
      'Early-stage and heads-down: SaaS that helps defense-adjacent companies keep AI agents compliant with deemed-export rules, tracking what code and data an agent can touch and proving it to auditors. Go backend, React front, building nights and weekends.',
    tags: ['founder', 'Go', 'React', 'compliance'],
  },
  {
    title: 'InvestIQ (stockApp)',
    blurb: 'My ET Money subscription lapsed, so I built the thing myself.',
    detail:
      'Multi-factor stock scoring, ML predictions with walk-forward validation, portfolio optimization, SIP planning, swing signals, and an automated trading engine with 6-layer risk validation, GTT and trailing stops, a circuit breaker, and a kill switch. Dockerized PWA I use daily.',
    tags: ['Python', 'React', 'ML', 'trading'],
  },
  {
    title: 'graphify',
    blurb: 'Knowledge-graph tooling for codebases, adopted across 40+ repos.',
    detail:
      'Turns any repo into a persistent knowledge graph: god nodes, community detection, and query/path/explain commands that return a scoped subgraph instead of grep noise. Became the default way my team asks architecture questions of unfamiliar services.',
    tags: ['DevEx', 'knowledge graphs', 'CLI'],
  },
  {
    title: 'On-call triage stack',
    blurb: 'Incident tooling that makes 3am pages less miserable.',
    detail:
      'Pulls alerts, traces, and logs into one triage flow with per-service runbooks, plus automated daily alert summaries posted per service. Built out of frustration during an on-call rotation; now part of how the team runs incidents.',
    tags: ['observability', 'incident response'],
  },
]
