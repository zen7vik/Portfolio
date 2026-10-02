import type { Metadata } from 'next'
import RideClient from '@/components/ride/RideClient'
import type { RideData } from '@/components/ride/types'
import { education, roles } from '@/content/experience'
import { getAllCases } from '@/lib/content'
import { getPosts } from '@/lib/medium'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: "Satvik's Delhi, a ride through my work",
  description: 'Drive a toy auto-rickshaw around a tiny Delhi island to explore the systems Satvik Singh has built.',
}

export default async function RidePage() {
  const posts = await getPosts()
  const data: RideData = {
    cases: getAllCases().map((c) => ({ slug: c.slug, title: c.title, hook: c.hook })),
    posts: posts.slice(0, 6).map((p) => ({
      id: p.id,
      title: p.title,
      url: p.url,
      publishedAt: p.publishedAt,
      readingMinutes: p.readingMinutes,
      onSite: Boolean(p.contentHtml),
    })),
    roles,
    education,
    links: {
      email: site.email,
      github: site.github,
      linkedin: site.linkedin,
      medium: site.medium,
      resume: site.resumePath,
    },
  }
  return <RideClient data={data} />
}
