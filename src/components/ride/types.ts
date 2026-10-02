import type { Role } from '@/content/experience'

export type RideData = {
  cases: { slug: string; title: string; hook: string }[]
  posts: { id: string; title: string; url: string; publishedAt: string; readingMinutes: number; onSite: boolean }[]
  roles: Role[]
  education: { school: string; degree: string; detail: string; period: string }
  links: { email: string; github: string; linkedin: string; medium: string; resume: string }
}
