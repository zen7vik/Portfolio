import { describe, expect, it } from 'vitest'
import { runCommand } from '@/components/terminal/commands'

const ctx = {
  cases: [
    { slug: 'workflow-platform', title: 'An extensible workflow automation platform' },
    { slug: 'risk-engine', title: 'A risk-scoring engine that stopped falling over' },
  ],
}

describe('runCommand', () => {
  it('help lists all commands', () => {
    const out = runCommand('help', ctx).lines.join('\n')
    for (const cmd of ['help', 'whoami', 'ls', 'open', 'resume', 'contact', 'clear']) {
      expect(out).toContain(cmd)
    }
  })

  it('whoami describes the engineer', () => {
    expect(runCommand('whoami', ctx).lines.join(' ')).toContain('Fullstack AI engineer')
  })

  it('ls work/ lists case slugs', () => {
    const out = runCommand('ls work/', ctx).lines.join('\n')
    expect(out).toContain('workflow-platform')
    expect(out).toContain('risk-engine')
  })

  it('open <slug> navigates', () => {
    expect(runCommand('open risk-engine', ctx).action).toEqual({ type: 'navigate', href: '/work/risk-engine' })
  })

  it('open with unknown slug errors without action', () => {
    const res = runCommand('open nope', ctx)
    expect(res.action).toBeUndefined()
    expect(res.lines.join(' ')).toContain('no such case study')
  })

  it('resume triggers download', () => {
    expect(runCommand('resume', ctx).action).toEqual({ type: 'download', href: '/resume.pdf' })
  })

  it('unknown command has the right message', () => {
    expect(runCommand('sudo rm -rf /', ctx).lines[0]).toBe("command not found: sudo (try 'help')")
  })
})
