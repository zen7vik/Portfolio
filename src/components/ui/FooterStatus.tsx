'use client'

import { useEffect, useState } from 'react'

const fmt = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Kolkata',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

export default function FooterStatus() {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const tick = () => setTime(fmt.format(new Date()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <p className="flex items-center gap-3 font-mono text-xs text-muted/70">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-green" />
      </span>
      Open to work · Gurugram, IN {time && `· ${time} IST`}
    </p>
  )
}
