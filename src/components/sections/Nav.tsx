'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, useMotionValueEvent, useScroll } from 'motion/react'
import { MagnifyingGlass } from '@phosphor-icons/react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { site } from '@/lib/site'

const links = [
  { href: '/#work', label: 'Work' },
  { href: '/#experience', label: 'Experience' },
  { href: '/#projects', label: 'Projects' },
  { href: '/#writing', label: 'Writing' },
]

export default function Nav() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24))

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled ? 'border-b border-line bg-bg/75 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 md:px-10">
        <Link href="/" className="text-[0.95rem] font-semibold tracking-tight text-fg">
          Satvik Singh
        </Link>
        <div className="flex items-center gap-1 md:gap-2">
          <ul className="mr-3 hidden items-center gap-7 md:flex">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="link-line text-[0.9rem] text-fg-2 transition-colors hover:text-fg">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <button
            type="button"
            aria-label="Open command palette"
            title="Search (Ctrl or Cmd + K)"
            onClick={() => window.dispatchEvent(new CustomEvent('open-palette'))}
            className="inline-flex size-9 items-center justify-center rounded-full text-fg-2 transition-colors hover:bg-fg/5 hover:text-fg"
          >
            <MagnifyingGlass size={17} />
          </button>
          <ThemeToggle />
          <a
            href={site.resumePath}
            download
            className="ml-1 inline-flex h-9 items-center rounded-full border border-fg/20 px-4 text-[0.85rem] font-medium text-fg transition-[background-color,color,transform] duration-200 hover:bg-fg hover:text-bg active:scale-[0.97]"
          >
            Resume
          </a>
        </div>
      </nav>
    </motion.header>
  )
}
