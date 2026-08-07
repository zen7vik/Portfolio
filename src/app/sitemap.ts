import type { MetadataRoute } from 'next'
import { getAllCases } from '@/lib/content'

const BASE = 'https://satvik.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, priority: 1 },
    ...getAllCases().map((c) => ({ url: `${BASE}/work/${c.slug}`, priority: 0.8 })),
  ]
}
