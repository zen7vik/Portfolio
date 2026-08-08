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

  it('extracts a stable id and full content html', () => {
    const posts = parseMediumFeed(xml)
    expect(posts[0].id).toBe('abc123')
    expect(posts[1].id).toBe('def456')
    expect(posts[0].contentHtml).toContain('<p>')
    expect(posts[0].contentHtml).not.toContain('<script')
  })

  it('returns [] on garbage input', () => {
    expect(parseMediumFeed('<not-rss/>')).toEqual([])
    expect(parseMediumFeed('not xml at all')).toEqual([])
  })
})
