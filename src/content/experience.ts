export type Role = {
  company: string
  title: string
  period: string
  place: string
  blurb: string
  points: string[]
}

export const roles: Role[] = [
  {
    company: 'Safe Security',
    title: 'Software Development Engineer',
    period: 'Jan 2025 to present',
    place: 'Delhi',
    blurb: 'Cyber-risk quantification and third-party risk platform. Go and TypeScript services, React, 6 production regions.',
    points: [
      'Own the cyber-risk scoring engine: 72M risk calculations a month across 6 regions and 354 tenants. Cut p95 API latency 53% (604 to 281 ms) and the error rate 58%.',
      'Own the agentic workflow platform on Temporal. Cut its failure rate from 12.3% to 3.8% while volume doubled, and replaced a 1.5-hour-downtime cluster migration with a one-second drain-and-flip.',
      'Designed and shipped the no-code HTTP integration node and its encrypted credential store across 6 services, with DNS-pinned SSRF defense and KMS so only ciphertext crosses service boundaries.',
      'Built and own the AI evidence pipeline behind questionnaire automation: malware scanning, chunking, and embedding into a hybrid vector and keyword index on OpenSearch Serverless.',
      'Shipped attribute-based access control with org-hierarchy scoping, a P0 that unblocked Fortune-500 deals, and a five-dimension executive vendor-risk view serving 2.2M requests a month.',
      'Built developer tooling the team adopted: a code knowledge graph pipeline live in 15 repositories and a Slack-native AI code reviewer teammates request by name.',
    ],
  },
  {
    company: 'Paisabazaar',
    title: 'Software Development Engineer',
    period: 'Jul 2023 to Jan 2025',
    place: 'Gurugram',
    blurb: "India's largest digital consumer-credit marketplace.",
    points: [
      'Cut response time about 80% on a core visit-ID service with a failsafe path, reducing undelivered OTPs by 10%.',
      'Built a company-wide authentication and authorization Java package for microservices, with request monitoring and LRU caching.',
      'Worked on the RBI Account Aggregator stack: onboarded a data provider and built consent workflows, webhook handling, and consent state.',
      'Built a rate limiter that cut dropped requests 10%, and voucher and refund tooling that made processing 20% faster.',
    ],
  },
]

export const education = {
  school: 'National Institute of Technology, Meghalaya',
  degree: 'B.Tech, Electrical and Electronics Engineering',
  detail: 'CGPA 9.0',
  period: '2019 to 2023',
}

export const stack: { label: string; items: string }[] = [
  { label: 'Languages', items: 'Go, TypeScript, Python, Java, SQL' },
  { label: 'Systems', items: 'Temporal, RabbitMQ, Kafka, REST, event-driven design, multi-tenancy, ABAC' },
  { label: 'Data and AI', items: 'Postgres, MySQL, DynamoDB, Redis, OpenSearch, RAG, embeddings, OpenAI, Bedrock, MCP' },
  { label: 'Infra and UI', items: 'AWS, ECS, Terraform, GitHub Actions, OpenTelemetry, React' },
]
