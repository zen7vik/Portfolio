import { marked } from 'marked'
import { getAllCases, getCase } from '@/lib/content'
import { getPosts } from '@/lib/medium'

export type ReaderDoc = {
  kind: 'case' | 'post'
  id: string
  title: string
  kicker: string
  summary?: string
  stats?: { value: string; label: string }[]
  html: string
  source?: string
}

export function caseDoc(slug: string): ReaderDoc | null {
  if (!getAllCases().some((c) => c.slug === slug)) return null
  const { meta, body } = getCase(slug)
  // the interactive diagram is rendered by the reader itself, not from markdown
  const md = body.replace(/<Scrolly[^>]*\/>/g, '')
  return {
    kind: 'case',
    id: slug,
    title: meta.title,
    kicker: `${meta.role}, ${meta.period}`,
    summary: meta.summary,
    stats: meta.stats,
    html: marked.parse(md, { async: false }),
  }
}

export async function postDoc(id: string): Promise<ReaderDoc | null> {
  const post = (await getPosts()).find((p) => p.id === id)
  if (!post?.contentHtml) return null
  const date = new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  return {
    kind: 'post',
    id,
    title: post.title,
    kicker: `${date}, ${post.readingMinutes} min read`,
    html: post.contentHtml,
    source: post.url,
  }
}
