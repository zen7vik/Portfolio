import { site } from '@/lib/site'

export type CmdAction = { type: 'navigate'; href: string } | { type: 'download'; href: string }

export type CmdResult = {
  lines: string[]
  action?: CmdAction
}

export type CmdContext = {
  cases: { slug: string; title: string }[]
}

export function runCommand(input: string, ctx: CmdContext): CmdResult {
  const [cmd, ...args] = input.trim().split(/\s+/)

  switch (cmd) {
    case '':
      return { lines: [] }
    case 'help':
      return {
        lines: [
          'available commands:',
          '  help              this list',
          '  whoami            who is this guy',
          '  ls work/          list case studies',
          '  open <slug>       open a case study',
          '  resume            download the resume',
          '  contact           how to reach me',
          '  clear             clear the terminal',
        ],
      }
    case 'whoami':
      return {
        lines: [
          'Satvik Singh',
          'Backend engineer · Go · distributed systems',
          '500M events/mo scoring engine · 147K workflows/mo platform · 6 regions',
        ],
      }
    case 'ls':
      if (args.length === 0 || args[0] === 'work/' || args[0] === 'work') {
        return { lines: ctx.cases.map((c) => `${c.slug.padEnd(22)} ${c.title}`) }
      }
      return { lines: [`ls: ${args[0]}: no such directory (try 'ls work/')`] }
    case 'open': {
      const slug = args[0]
      const found = ctx.cases.find((c) => c.slug === slug)
      if (!found) {
        return { lines: [`open: ${slug ?? ''}: no such case study (try 'ls work/')`] }
      }
      return { lines: [`opening ${found.title}…`], action: { type: 'navigate', href: `/work/${found.slug}` } }
    }
    case 'resume':
      return { lines: ['downloading resume.pdf…'], action: { type: 'download', href: site.resumePath } }
    case 'contact':
      return {
        lines: [`email     ${site.email}`, `github    ${site.github}`, `linkedin  ${site.linkedin}`, `medium    ${site.medium}`],
      }
    case 'clear':
      return { lines: [] }
    default:
      return { lines: [`command not found: ${cmd} (try 'help')`] }
  }
}
