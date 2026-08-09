import FooterStatus from '@/components/ui/FooterStatus'
import GlowRow from '@/components/ui/GlowRow'
import Reveal from '@/components/ui/Reveal'
import { site } from '@/lib/site'

export default function Contact() {
  return (
    <section id="contact" className="text-scrim mx-auto max-w-6xl px-6 pb-16 pt-32 md:px-16">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-indigo">Contact</p>
        <h2 className="mt-4 font-display text-5xl font-bold tracking-tight md:text-7xl">Let's talk</h2>
      </Reveal>
      <Reveal delay={0.15}>
        <GlowRow accent="#f27a8a" intensity={1.7} className="inline-block">
          <a
            href={`mailto:${site.email}`}
            className="mt-8 inline-block break-all font-display text-2xl text-muted underline decoration-fg/20 underline-offset-8 transition-colors hover:text-rose md:text-4xl"
          >
            {site.email}
          </a>
        </GlowRow>
      </Reveal>
      <Reveal delay={0.25}>
        <div className="mt-12 flex flex-wrap gap-6 font-mono text-sm text-muted">
          <a href={site.github} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-fg">
            GitHub
          </a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-fg">
            LinkedIn
          </a>
          <a href={site.medium} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-fg">
            Medium
          </a>
        </div>
      </Reveal>
      <footer className="mt-24 flex flex-col gap-3 border-t border-fg/10 pt-6 md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-xs text-muted/70">
          Built with Next.js, Three.js, GSAP.
          <span className="hidden md:inline">
            {' '}
            Press <kbd className="rounded border border-fg/20 px-1.5 py-0.5">~</kbd> for the terminal.
          </span>
        </p>
        <FooterStatus />
      </footer>
    </section>
  )
}
