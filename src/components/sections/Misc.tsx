import Reveal from '@/components/ui/Reveal'
import GlowRow from '@/components/ui/GlowRow'
import SectionHeading from '@/components/ui/SectionHeading'
import { miscItems } from '@/content/misc'

export default function Misc() {
  return (
    <section id="personal" className="text-scrim mx-auto max-w-6xl px-6 py-32 md:px-16">
      <SectionHeading eyebrow="Personal" title="Projects and side quests" />
      <div className="mt-14 divide-y divide-fg/10">
        {miscItems.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.06}>
            <GlowRow accent="#f0b35e" className="group">
              <div className="flex flex-col gap-2 rounded-lg px-2 py-6 transition-colors group-hover:bg-fg/5 md:flex-row md:items-baseline md:gap-8">
                <h3 className="w-56 shrink-0 font-display text-lg font-semibold transition-colors group-hover:text-amber">
                  {item.title}
                </h3>
                <p className="flex-1 text-muted">{item.blurb}</p>
                <span className="shrink-0 font-mono text-xs text-muted/70">{item.tags.join(' · ')}</span>
              </div>
            </GlowRow>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
