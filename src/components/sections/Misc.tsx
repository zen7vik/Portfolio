import PersonalRow from '@/components/sections/PersonalRow'
import Reveal from '@/components/ui/Reveal'
import SectionHeading from '@/components/ui/SectionHeading'
import { miscItems } from '@/content/misc'

export default function Misc() {
  return (
    <section id="personal" className="text-scrim mx-auto max-w-6xl px-6 py-32 md:px-16">
      <SectionHeading eyebrow="Personal" title="Projects and side quests" />
      <div className="mt-14 divide-y divide-fg/10">
        {miscItems.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.06}>
            <PersonalRow item={item} />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
