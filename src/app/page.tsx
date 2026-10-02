import RoomExperience from '@/components/room/RoomExperience'
import type { RoomData } from '@/components/room/types'
import { getAllCases } from '@/lib/content'
import { getPosts } from '@/lib/medium'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export default async function Home() {
  const posts = await getPosts()
  const data: RoomData = {
    cases: getAllCases().map((c) => ({ slug: c.slug, title: c.title, hook: c.hook, stats: c.stats })),
    posts: posts.slice(0, 8).map((p) => ({
      id: p.id,
      title: p.title,
      href: p.contentHtml ? `/writing/${p.id}` : p.url,
      external: !p.contentHtml,
      date: formatDate(p.publishedAt),
      minutes: p.readingMinutes,
    })),
  }
  return <RoomExperience data={data} />
}
