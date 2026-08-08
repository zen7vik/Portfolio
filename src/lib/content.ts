import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const DIR = path.join(process.cwd(), 'src/content/work')

export type CaseMeta = {
  slug: string
  title: string
  hook: string
  role: string
  period: string
  accent: 'indigo' | 'green' | 'amber' | 'rose'
  stats: { value: string; label: string }[]
  summary: string
  order: number
}

export function getAllCases(): CaseMeta[] {
  return readdirSync(DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => {
      const { data } = matter(readFileSync(path.join(DIR, f), 'utf8'))
      return { ...(data as Omit<CaseMeta, 'slug'>), slug: f.replace(/\.mdx$/, '') }
    })
    .sort((a, b) => a.order - b.order)
}

export function getCase(slug: string) {
  const { data, content } = matter(readFileSync(path.join(DIR, `${slug}.mdx`), 'utf8'))
  return { meta: { ...(data as Omit<CaseMeta, 'slug'>), slug }, body: content }
}
