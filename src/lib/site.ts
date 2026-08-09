export const site = {
  name: 'Satvik Singh',
  title: 'Satvik Singh, Fullstack AI Engineer',
  url: 'https://zen7vik.vercel.app',
  tagline: "Fullstack AI engineer. I build distributed systems that don't fall over.",
  description:
    'Distributed systems, AI pipelines, and the platforms behind them: risk scoring at 500M events/month, workflow automation at 147K runs/month.',
  email: 'satvik19nitm@gmail.com',
  github: 'https://github.com/zen7vik',
  medium: 'https://medium.com/@satvik19nitm',
  mediumFeed: 'https://medium.com/feed/@satvik19nitm',
  linkedin: 'https://www.linkedin.com/in/satvik-singh-3989a51b5/',
  resumePath: '/resume.pdf',
  stats: [
    { value: '500M', label: 'events/mo through my scoring engine' },
    { value: 'p99 585ms', label: 'risk evaluations at scale' },
    { value: '6', label: 'production regions' },
    { value: '147K', label: 'workflows/mo on my platform' },
  ],
} as const

export type Site = typeof site
