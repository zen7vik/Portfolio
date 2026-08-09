import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import CaseSceneSetter from '@/components/case/CaseSceneSetter'
import ReadingProgress from '@/components/ui/ReadingProgress'
import { getPosts } from '@/lib/medium'

export const revalidate = 86400
export const dynamicParams = true

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ id: p.id }))
}

export async function generateMetadata({ params }: PageProps<'/writing/[id]'>): Promise<Metadata> {
  const { id } = await params
  const post = (await getPosts()).find((p) => p.id === id)
  return post ? { title: `${post.title}, Satvik Singh`, description: `Writing by Satvik Singh` } : {}
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function WritingPage({ params }: PageProps<'/writing/[id]'>) {
  const { id } = await params
  const post = (await getPosts()).find((p) => p.id === id)
  if (!post) notFound()
  if (!post.contentHtml) redirect(post.url)

  return (
    <main className="text-scrim">
      <CaseSceneSetter accent="#5ac8dd" formation="ambient" intensity={0.3} />
      <nav className="sticky top-0 z-20 border-b border-fg/10 bg-bg/80 backdrop-blur-md">
        <div className="relative mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/#writing" className="font-mono text-sm text-muted transition-colors hover:text-fg">
            ← satvik
          </Link>
          <span className="font-mono text-xs text-muted/70">writing</span>
        </div>
        <ReadingProgress accent="#5ac8dd" />
      </nav>
      <article className="mx-auto max-w-3xl px-6 pb-24 pt-20">
        <p className="font-mono text-xs uppercase tracking-[0.25em] text-cyan">
          {formatDate(post.publishedAt)} · {post.readingMinutes} min read
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight md:text-5xl">{post.title}</h1>
        <div className="blog-prose mt-10" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        <footer className="mt-16 border-t border-fg/10 pt-8">
          <a href={post.url} className="font-mono text-sm text-muted transition-colors hover:text-fg">
            Originally published on Medium →
          </a>
        </footer>
      </article>
    </main>
  )
}
