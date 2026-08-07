import WorkCard from '@/components/sections/WorkCard'
import Reveal from '@/components/ui/Reveal'
import SectionHeading from '@/components/ui/SectionHeading'
import type { CaseMeta } from '@/lib/content'

export default function Work({ cases }: { cases: CaseMeta[] }) {
  return (
    <section id="work" className="mx-auto max-w-6xl px-6 py-32 md:px-16">
      <SectionHeading eyebrow="Selected work" title="Systems I've built and run" />
      <div className="mt-14 grid gap-6 md:grid-cols-2">
        {cases.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.1}>
            <WorkCard meta={c} index={i} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
