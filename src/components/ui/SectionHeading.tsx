import Reveal from '@/components/ui/Reveal'
import ScrambleTitle from '@/components/ui/ScrambleTitle'

type SectionHeadingProps = {
  eyebrow: string
  title: string
}

export default function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <Reveal>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-indigo">{eyebrow}</p>
      <ScrambleTitle text={title} className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl" />
    </Reveal>
  )
}
