import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import SubNav from '@/components/ui/SubNav'
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
    <>
      <SubNav back="/" label="Writing" />
      <main>
        <article className="mx-auto max-w-[44rem] px-5 pb-24 pt-16 md:pt-24">
          <p className="text-[0.95rem] text-fg-2">
            {formatDate(post.publishedAt)}, {post.readingMinutes} min read
          </p>
          <h1 className="display-tight mt-5 text-[clamp(2.1rem,5vw,3.4rem)] text-fg">{post.title}</h1>
          <div className="blog-prose mt-12" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
          <footer className="mt-16 border-t border-line pt-8">
            <a href={post.url} className="link-line text-[0.95rem] text-fg-2 hover:text-fg">
              Originally published on Medium
            </a>
          </footer>
        </article>
      </main>
    </>
  )
}
