import { XMLParser } from 'fast-xml-parser'
import fallback from '@/content/writing-fallback.json'
import { site } from '@/lib/site'

export type Post = {
  id: string
  title: string
  url: string
  publishedAt: string
  readingMinutes: number
  /** full post body from the RSS feed; absent on fallback data */
  contentHtml?: string
}

function sanitize(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+="[^"]*"/gi, '')
}

export function parseMediumFeed(xml: string): Post[] {
  try {
    const doc = new XMLParser({ ignoreAttributes: false }).parse(xml)
    const items = doc?.rss?.channel?.item
    const list = Array.isArray(items) ? items : items ? [items] : []
    return list
      .map((it: Record<string, unknown>) => {
        const html = String(it['content:encoded'] ?? '')
        const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
        const date = new Date(String(it.pubDate ?? ''))
        const url = String(it.link ?? '').split('?')[0]
        return {
          id: url.split('-').pop() ?? '',
          title: String(it.title ?? ''),
          url,
          publishedAt: Number.isNaN(date.getTime()) ? '' : date.toISOString(),
          readingMinutes: Math.max(1, Math.round(words / 200)),
          contentHtml: sanitize(html),
        }
      })
      .filter((p) => p.id && p.title && p.url && p.publishedAt)
  } catch {
    return []
  }
}

export async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(site.mediumFeed, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(String(res.status))
    const posts = parseMediumFeed(await res.text())
    return posts.length ? posts : (fallback as Post[])
  } catch {
    return fallback as Post[]
  }
}
