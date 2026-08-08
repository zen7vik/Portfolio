'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { site } from '@/lib/site'

type PaletteItem = {
  label: string
  group: string
  run: () => void
}

export default function CommandPalette({
  cases,
  onClose,
  onOpenTerminal,
}: {
  cases: { slug: string; title: string }[]
  onClose: () => void
  onOpenTerminal: () => void
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const items = useMemo<PaletteItem[]>(() => {
    const nav = (href: string) => () => {
      onClose()
      router.push(href)
    }
    const ext = (href: string) => () => {
      onClose()
      window.open(href, '_blank', 'noopener')
    }
    return [
      { label: 'Work', group: 'Go to', run: nav('/#work') },
      { label: 'Writing', group: 'Go to', run: nav('/#writing') },
      { label: 'Contact', group: 'Go to', run: nav('/#contact') },
      ...cases.map((c) => ({ label: c.title, group: 'Case studies', run: nav(`/work/${c.slug}`) })),
      {
        label: 'Download resume',
        group: 'Actions',
        run: () => {
          onClose()
          const a = document.createElement('a')
          a.href = site.resumePath
          a.download = ''
          a.click()
        },
      },
      {
        label: 'Open terminal',
        group: 'Actions',
        run: () => {
          onClose()
          onOpenTerminal()
        },
      },
      { label: 'GitHub', group: 'Links', run: ext(site.github) },
      { label: 'LinkedIn', group: 'Links', run: ext(site.linkedin) },
      { label: 'Medium', group: 'Links', run: ext(site.medium) },
    ]
  }, [cases, onClose, onOpenTerminal, router])

  const filtered = useMemo(
    () => items.filter((it) => it.label.toLowerCase().includes(query.toLowerCase())),
    [items, query],
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setSelected(0)
  }, [query])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, 0))
    } else if (e.key === 'Enter') {
      filtered[selected]?.run()
    } else if (e.key === 'Escape') onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-bg/70 p-4 pt-[18vh] backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-label="Command palette"
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-xl border border-fg/20 bg-[#10131d] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Type to search…"
          className="w-full border-b border-fg/10 bg-transparent px-5 py-4 font-mono text-sm text-fg outline-none placeholder:text-muted/60"
          spellCheck={false}
          aria-label="Palette search"
        />
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 && <p className="px-5 py-3 font-mono text-sm text-muted">No matches</p>}
          {filtered.map((it, i) => (
            <button
              key={`${it.group}-${it.label}`}
              onClick={it.run}
              onMouseEnter={() => setSelected(i)}
              className={`flex w-full items-center justify-between px-5 py-2.5 text-left font-mono text-sm transition-colors ${
                i === selected ? 'bg-indigo/15 text-fg' : 'text-muted'
              }`}
            >
              <span>{it.label}</span>
              <span className="text-xs text-muted/60">{it.group}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
