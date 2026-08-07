import { describe, expect, it } from 'vitest'
import { getAllCases, getCase } from '@/lib/content'

describe('content', () => {
  it('loads all four case studies in order', () => {
    expect(getAllCases().map((c) => c.slug)).toEqual([
      'workflow-platform',
      'risk-engine',
      'rag-pipeline',
      'data-exchange',
    ])
  })

  it('every case has hook, stats, summary, accent', () => {
    for (const c of getAllCases()) {
      expect(c.title.length).toBeGreaterThan(5)
      expect(c.hook.length).toBeGreaterThan(10)
      expect(c.stats.length).toBeGreaterThanOrEqual(2)
      expect(c.summary.length).toBeGreaterThan(20)
      expect(['indigo', 'green']).toContain(c.accent)
    }
  })

  it('getCase returns MDX body with required sections', () => {
    const { body } = getCase('workflow-platform')
    for (const h of ['## The problem', '## The system', '## Key decisions', '## Outcomes', "## What I'd do differently"]) {
      expect(body).toContain(h)
    }
  })
})
