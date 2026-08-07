'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { runCommand } from '@/components/terminal/commands'

type HistoryEntry = { prompt?: string; lines: string[] }

export default function Terminal({
  cases,
  onClose,
}: {
  cases: { slug: string; title: string }[]
  onClose: () => void
}) {
  const router = useRouter()
  const [history, setHistory] = useState<HistoryEntry[]>([
    { lines: ["satvik@portfolio — type 'help'"] },
  ])
  const [input, setInput] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [history])

  const submit = () => {
    const cmd = input.trim()
    setInput('')
    setHistIdx(-1)
    if (!cmd) return
    setCmdHistory((h) => [cmd, ...h])
    if (cmd === 'clear') {
      setHistory([])
      return
    }
    const result = runCommand(cmd, { cases })
    setHistory((h) => [...h, { prompt: cmd, lines: result.lines }])
    if (result.action?.type === 'navigate') {
      setTimeout(() => {
        onClose()
        router.push(result.action!.href)
      }, 350)
    } else if (result.action?.type === 'download') {
      const a = document.createElement('a')
      a.href = result.action.href
      a.download = ''
      a.click()
    }
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') submit()
    else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(histIdx + 1, cmdHistory.length - 1)
      if (cmdHistory[next]) {
        setHistIdx(next)
        setInput(cmdHistory[next])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = histIdx - 1
      setHistIdx(next)
      setInput(next >= 0 ? cmdHistory[next] : '')
    } else if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg/70 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-label="Terminal"
    >
      <div
        className="flex h-[70vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-fg/20 bg-[#0b1020] shadow-2xl"
        onClick={(e) => {
          e.stopPropagation()
          inputRef.current?.focus()
        }}
      >
        <div className="flex items-center gap-2 border-b border-fg/10 px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-xs text-muted">satvik@portfolio — zsh</span>
          <button onClick={onClose} className="ml-auto font-mono text-xs text-muted hover:text-fg" aria-label="Close terminal">
            esc
          </button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-sm leading-relaxed text-[#c9f7d4]">
          {history.map((entry, i) => (
            <div key={i} className="mb-2">
              {entry.prompt !== undefined && (
                <div>
                  <span className="text-indigo">❯</span> <span className="text-fg">{entry.prompt}</span>
                </div>
              )}
              {entry.lines.map((line, j) => (
                <div key={j} className="whitespace-pre-wrap">
                  {line}
                </div>
              ))}
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="text-indigo">❯</span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              className="flex-1 bg-transparent font-mono text-sm text-fg caret-[#c9f7d4] outline-none"
              spellCheck={false}
              autoComplete="off"
              aria-label="Terminal input"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
