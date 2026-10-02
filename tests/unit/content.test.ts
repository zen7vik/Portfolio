import { describe, expect, it } from 'vitest'
import { getAllCases, getCase } from '@/lib/content'

describe('content', () => {
  it('loads all five case studies in order', () => {
    expect(getAllCases().map((c) => c.slug)).toEqual([
      'workflow-platform',
      'risk-engine',
      'temporal-migration',
      'rag-pipeline',
      'data-exchange',
    ])
  })

  it('every case has hook, stats, summary', () => {
    for (const c of getAllCases()) {
      expect(c.title.length).toBeGreaterThan(5)
      expect(c.hook.length).toBeGreaterThan(10)
      expect(c.stats.length).toBeGreaterThanOrEqual(2)
      expect(c.summary.length).toBeGreaterThan(20)
    }
  })

  it('every case body has the required sections', () => {
    for (const c of getAllCases()) {
      const { body } = getCase(c.slug)
      for (const h of ['## The problem', '## The system', '## Key decisions', '## Outcomes', "## What I'd do differently"]) {
        expect(body, `${c.slug} missing ${h}`).toContain(h)
      }
    }
  })

  it('never repeats figures the evidence sweep disproved', () => {
    for (const c of getAllCases()) {
      const { body, meta } = getCase(c.slug)
      const text = body + JSON.stringify(meta)
      for (const bad of ['500M', '147K', '24 incident', 'Kill switch']) expect(text, `${c.slug}: ${bad}`).not.toContain(bad)
    }
  })
})
