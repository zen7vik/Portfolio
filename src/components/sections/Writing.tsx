import Link from 'next/link'
import { ArrowUpRight } from '@phosphor-icons/react/dist/ssr'
import Reveal from '@/components/ui/Reveal'
import SplitWords from '@/components/ui/SplitWords'
import type { Post } from '@/lib/medium'
import { site } from '@/lib/site'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default function Writing({ posts }: { posts: Post[] }) {
  return (
    <section id="writing" className="border-t border-line">
      <div className="mx-auto max-w-[1320px] px-5 py-24 md:px-10 md:py-36">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SplitWords text="Writing" className="display-tight text-[clamp(2.2rem,4.6vw,3.9rem)]" />
          <a
            href={site.medium}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 text-[0.95rem] font-medium text-fg"
          >
            <span className="link-line">All posts on Medium</span>
            <ArrowUpRight size={15} weight="bold" />
          </a>
        </div>

        <div className="mt-12 grid gap-x-12 md:grid-cols-2">
          {posts.map((p, i) => (
            <Reveal key={p.id} delay={(i % 2) * 0.06}>
              <Link
                href={p.contentHtml ? `/writing/${p.id}` : p.url}
                className="group block h-full border-t border-line py-8"
              >
                <p className="text-sm text-muted">
                  {formatDate(p.publishedAt)}, {p.readingMinutes} min read
                </p>
                <h3 className="mt-3 text-[1.3rem] font-semibold leading-snug tracking-[-0.015em] text-fg transition-colors duration-300 group-hover:text-accent-ink md:text-[1.45rem]">
                  {p.title}
                </h3>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
