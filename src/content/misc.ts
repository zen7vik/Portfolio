export type MiscItem = {
  title: string
  blurb: string
  tags: string[]
}

export const miscItems: MiscItem[] = [
  {
    title: 'Questionnaire AI review',
    blurb:
      'LLM-assisted review of vendor questionnaire answers against uploaded evidence, flagging contradictions before an analyst ever reads them.',
    tags: ['LLM', 'RAG', 'TPRM'],
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
  {
    title: 'InvestIQ',
    blurb:
      'Personal AI investment platform: automated trading engine with 6-layer risk validation, XGBoost ensemble with walk-forward validation, FinBERT sentiment, HRP portfolio optimization.',
    tags: ['Python', 'ML', 'personal'],
  },
]
