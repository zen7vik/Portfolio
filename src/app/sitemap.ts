import type { MetadataRoute } from 'next'
import { getAllCases } from '@/lib/content'
import { site } from '@/lib/site'

const BASE = site.url

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, priority: 1 },
    { url: `${BASE}/read`, priority: 0.9 },
    { url: `${BASE}/ride`, priority: 0.6 },
    ...getAllCases().map((c) => ({ url: `${BASE}/work/${c.slug}`, priority: 0.8 })),
  ]
}
