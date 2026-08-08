import Reveal from '@/components/ui/Reveal'

type SectionHeadingProps = {
  eyebrow: string
  title: string
}

export default function SectionHeading({ eyebrow, title }: SectionHeadingProps) {
  return (
    <Reveal>
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-indigo">{eyebrow}</p>
      <h2 className="mt-3 font-display text-4xl font-bold tracking-tight md:text-5xl">{title}</h2>
    </Reveal>
  )
}
