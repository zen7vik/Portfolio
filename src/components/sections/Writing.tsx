import Link from 'next/link'
import MagneticButton from '@/components/ui/MagneticButton'
import GlowRow from '@/components/ui/GlowRow'
import Reveal from '@/components/ui/Reveal'
import SectionHeading from '@/components/ui/SectionHeading'
import type { Post } from '@/lib/medium'
import { site } from '@/lib/site'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function Writing({ posts }: { posts: Post[] }) {
  return (
    <section id="writing" className="text-scrim mx-auto max-w-6xl px-6 py-32 md:px-16">
      <SectionHeading eyebrow="Writing" title="Things I've written down" />
      <div className="mt-14 space-y-1">
        {posts.length === 0 ? (
          <Reveal>
            <a
              href={site.medium}
              className="block rounded-2xl border border-fg/10 p-8 text-muted transition-colors hover:border-cyan/60"
            >
              Read my posts on Medium →
            </a>
          </Reveal>
        ) : (
          posts.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <GlowRow accent="#5ac8dd">
                <Link
                  href={`/writing/${p.id}`}
                  className="group flex flex-col gap-1 rounded-xl px-4 py-5 transition-colors hover:bg-fg/5 md:flex-row md:items-baseline md:gap-6"
                >
                  <span className="w-28 shrink-0 font-mono text-xs text-muted">{formatDate(p.publishedAt)}</span>
                  <span className="flex-1 font-display text-lg font-medium leading-snug transition-colors group-hover:text-cyan">
                    {p.title}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-muted">{p.readingMinutes} min read</span>
                </Link>
              </GlowRow>
            </Reveal>
          ))
        )}
      </div>
      <Reveal delay={0.2}>
        <div className="mt-10">
          <MagneticButton href={site.medium}>More on Medium</MagneticButton>
        </div>
      </Reveal>
    </section>
  )
}
