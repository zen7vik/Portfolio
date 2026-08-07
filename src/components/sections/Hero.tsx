import MagneticButton from '@/components/ui/MagneticButton'
import Reveal from '@/components/ui/Reveal'
import { site } from '@/lib/site'

export default function Hero() {
  return (
    <section id="hero" className="relative flex min-h-screen flex-col justify-end px-6 pb-16 md:px-16">
      <h1 className="hero-title">Satvik Singh</h1>
      <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <Reveal immediate delay={1.6}>
            <p className="font-display text-2xl font-medium leading-snug text-fg md:text-3xl">{site.tagline}</p>
          </Reveal>
          <Reveal immediate delay={1.8}>
            <div className="mt-6 flex flex-wrap gap-2">
              {site.stats.map((s) => (
                <span
                  key={s.label}
                  className="rounded-full border border-fg/15 px-3 py-1.5 font-mono text-xs text-muted"
                >
                  <span className="text-fg">{s.value}</span> {s.label}
                </span>
              ))}
            </div>
          </Reveal>
          <Reveal immediate delay={2}>
            <div className="mt-8 flex items-center gap-5">
              <MagneticButton href={site.resumePath} download>
                Resume
              </MagneticButton>
              <a href={site.github} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-muted transition-colors hover:text-fg">
                GitHub
              </a>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="font-mono text-sm text-muted transition-colors hover:text-fg">
                LinkedIn
              </a>
            </div>
          </Reveal>
        </div>
        <Reveal immediate delay={2.2}>
          <a href="#about" aria-label="Scroll to about" className="hidden md:block">
            <div className="flex h-12 w-8 items-start justify-center rounded-full border border-fg/20 p-2">
              <div className="h-2 w-1 animate-bounce rounded-full bg-fg/60" style={{ animationDuration: '1.8s' }} />
            </div>
          </a>
        </Reveal>
      </div>
    </section>
  )
}
