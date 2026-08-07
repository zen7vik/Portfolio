import { existsSync } from 'node:fs'
import path from 'node:path'
import Reveal from '@/components/ui/Reveal'
import SectionHeading from '@/components/ui/SectionHeading'

const skillGroups: { label: string; items: string[] }[] = [
  { label: 'Languages', items: ['Go', 'TypeScript', 'Java', 'Python', 'SQL'] },
  {
    label: 'Backend',
    items: ['microservices', 'distributed systems', 'Kafka/RabbitMQ', 'Temporal', 'multi-tenancy', 'ABAC'],
  },
  { label: 'Data', items: ['PostgreSQL', 'MySQL', 'DynamoDB', 'Cassandra', 'Redis'] },
  { label: 'AI/ML', items: ['RAG', 'vector search', 'OpenSearch', 'LLM integration', 'guardrails'] },
  { label: 'Infra', items: ['AWS', 'ECS', 'Docker', 'CI/CD', 'OTel/Datadog/Observe'] },
]

export default function About() {
  const hasPhoto = existsSync(path.join(process.cwd(), 'public/me.jpg'))

  return (
    <section id="about" className="text-scrim mx-auto max-w-6xl px-6 py-32 md:px-16">
      <SectionHeading eyebrow="About" title="Systems that hold up in production" />
      <div className="mt-14 grid gap-14 md:grid-cols-2">
        <Reveal>
          <div className="space-y-5 text-lg leading-relaxed text-muted">
            {hasPhoto && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src="/me.jpg"
                alt="Satvik Singh"
                className="mb-8 w-44 rounded-sm border border-fg/15 grayscale transition-all duration-500 hover:grayscale-0"
              />
            )}
            <p>
              I'm a backend engineer with 3 years building Go and TypeScript microservices for enterprise
              cyber-risk platforms. I've founded two services from scratch and now own the risk-scoring engine
              and the workflow automation platform at Safe Security.
            </p>
            <p>
              My work lives where correctness meets scale: event-driven pipelines, multi-tenant data isolation,
              reliability engineering, and lately the AI plumbing behind document analysis and questionnaire
              automation. I care about systems that stay boring under load.
            </p>
          </div>
        </Reveal>
        <div className="space-y-6">
          {skillGroups.map((g, i) => (
            <Reveal key={g.label} delay={i * 0.08}>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 border-b border-fg/10 pb-4">
                <span className="w-24 shrink-0 font-mono text-xs uppercase tracking-widest text-indigo">
                  {g.label}
                </span>
                <span className="font-mono text-sm text-fg/80">{g.items.join(' · ')}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
