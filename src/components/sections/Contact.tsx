'use client'

import { useState } from 'react'
import { ArrowUpRight, Check, Copy } from '@phosphor-icons/react'
import Reveal from '@/components/ui/Reveal'
import SplitWords from '@/components/ui/SplitWords'
import { site } from '@/lib/site'

const links = [
  { label: 'GitHub', href: site.github },
  { label: 'LinkedIn', href: site.linkedin },
  { label: 'Medium', href: site.medium },
]

export default function Contact() {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {}
  }

  return (
    <section id="contact" className="border-t border-line">
      <div className="mx-auto max-w-[1320px] px-5 pb-10 pt-24 md:px-10 md:pt-36">
        <SplitWords
          text="Have a hard systems problem?"
          className="display max-w-4xl text-[clamp(2.6rem,6.4vw,5.6rem)]"
        />
        <Reveal delay={0.15}>
          <p className="mt-6 max-w-[36rem] text-lg leading-relaxed text-fg-2">
            I like talking about distributed systems, AI infrastructure, and anything on this page.
          </p>
        </Reveal>
        <Reveal delay={0.25}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href={`mailto:${site.email}`}
              className="group inline-flex h-14 items-center gap-2 rounded-full bg-accent px-7 text-base font-semibold text-on-accent transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
            >
              Email me
              <ArrowUpRight size={17} weight="bold" />
            </a>
            <button
              type="button"
              onClick={copy}
              className="inline-flex h-14 items-center gap-2.5 rounded-full border border-fg/20 px-6 font-mono text-[0.9rem] text-fg transition-colors hover:border-fg/50"
            >
              {site.email}
              {copied ? <Check size={16} className="text-ok" /> : <Copy size={16} className="text-muted" />}
              <span className="sr-only" aria-live="polite">
                {copied ? 'Copied' : ''}
              </span>
            </button>
          </div>
        </Reveal>

        <footer className="mt-28 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-center md:justify-between">
          <ul className="flex flex-wrap gap-x-7 gap-y-2">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-line text-[0.95rem] text-fg-2 transition-colors hover:text-fg"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href={site.resumePath} download className="link-line text-[0.95rem] text-fg-2 transition-colors hover:text-fg">
                Resume
              </a>
            </li>
          </ul>
          <p className="text-sm text-muted">
            {site.name}, {site.location}. Press{' '}
            <kbd className="rounded border border-line px-1.5 py-0.5 font-mono text-xs">Ctrl K</kbd> to search.
          </p>
        </footer>
      </div>
    </section>
  )
}
