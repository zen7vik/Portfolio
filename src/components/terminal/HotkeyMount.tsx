'use client'

import { useEffect, useState } from 'react'
import CommandPalette from '@/components/terminal/CommandPalette'
import Terminal from '@/components/terminal/Terminal'

export default function HotkeyMount({ cases }: { cases: { slug: string; title: string }[] }) {
  const [overlay, setOverlay] = useState<'none' | 'terminal' | 'palette'>('none')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      if ((e.key === '~' || e.key === '`') && !typing) {
        e.preventDefault()
        setOverlay((o) => (o === 'terminal' ? 'none' : 'terminal'))
      } else if (e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOverlay((o) => (o === 'palette' ? 'none' : 'palette'))
      }
    }
    const onOpenPalette = () => setOverlay('palette')
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-palette', onOpenPalette)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-palette', onOpenPalette)
    }
  }, [])

  if (overlay === 'terminal') return <Terminal cases={cases} onClose={() => setOverlay('none')} />
  if (overlay === 'palette')
    return (
      <CommandPalette
        cases={cases}
        onClose={() => setOverlay('none')}
        onOpenTerminal={() => setOverlay('terminal')}
      />
    )
  return null
}
