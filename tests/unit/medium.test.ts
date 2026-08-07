import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { parseMediumFeed } from '@/lib/medium'

const xml = readFileSync('tests/fixtures/medium-feed.xml', 'utf8')

describe('parseMediumFeed', () => {
  it('extracts posts with title, url, date, reading time', () => {
    const posts = parseMediumFeed(xml)
    expect(posts).toHaveLength(2)
    expect(posts[0].title).toBe('First Post Title')
    expect(posts[0].url).toMatch(/^https:\/\/medium\.com/)
    expect(posts[0].url).not.toContain('?')
    expect(new Date(posts[0].publishedAt).getFullYear()).toBeGreaterThan(2020)
    expect(posts[0].readingMinutes).toBeGreaterThanOrEqual(2)
    expect(posts[1].readingMinutes).toBe(1)
  })

  it('returns [] on garbage input', () => {
    expect(parseMediumFeed('<not-rss/>')).toEqual([])
    expect(parseMediumFeed('not xml at all')).toEqual([])
  })
})
