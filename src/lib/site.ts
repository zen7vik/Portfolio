export const site = {
  name: 'Satvik Singh',
  title: 'Satvik Singh, Fullstack AI Engineer',
  url: 'https://zen7vik.vercel.app',
  role: 'Fullstack AI engineer',
  location: 'Delhi, India',
  intro:
    'I own the risk engine behind 72M monthly calculations and the workflow platform customers automate on, from Go services to React.',
  description:
    'Fullstack AI engineer building Go and TypeScript systems: a risk-scoring engine running 72M calculations a month across 6 regions, a Temporal workflow platform, and the RAG pipeline behind AI questionnaire automation.',
  email: 'satvik19nitm@gmail.com',
  github: 'https://github.com/zen7vik',
  medium: 'https://medium.com/@satvik19nitm',
  mediumFeed: 'https://medium.com/feed/@satvik19nitm',
  linkedin: 'https://www.linkedin.com/in/satvik-singh-3989a51b5/',
  resumePath: '/resume.pdf',
  // production telemetry, 30 days to 2026-09-11 (Observe, unsampled logs)
  proof: [
    { value: 72, suffix: 'M', label: 'risk calculations a month', note: '6 production regions, 354 tenants' },
    { value: 53, suffix: '%', prefix: '-', label: 'p95 latency on the scoring API', note: '604 ms down to 281 ms' },
    { value: 3.8, suffix: '%', decimals: 1, label: 'workflow failure rate', note: 'down from 12.3% at twice the volume' },
    { value: 0, label: 'errors across 19.7K cross-tenant syncs', note: 'last 30 days, 4 regions' },
  ],
} as const

export type Site = typeof site
