'use client'

import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { prefersReducedMotion } from '@/lib/motion'

gsap.registerPlugin(useGSAP)

type MagneticButtonProps = {
  href: string
  children: React.ReactNode
  download?: boolean
  external?: boolean
  className?: string
}

export default function MagneticButton({ href, children, download, external, className = '' }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null)

  useGSAP(
    () => {
      const el = ref.current
      if (!el || prefersReducedMotion()) return
      const strength = 0.3
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        gsap.to(el, { x: dx * strength, y: dy * strength, duration: 0.4, ease: 'power3.out' })
      }
      const onLeave = () => gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' })
      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
      return () => {
        el.removeEventListener('mousemove', onMove)
        el.removeEventListener('mouseleave', onLeave)
      }
    },
    { scope: ref },
  )

  return (
    <a
      ref={ref}
      href={href}
      download={download}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`inline-block rounded-full border border-indigo px-6 py-3 font-mono text-sm uppercase tracking-widest text-fg transition-colors duration-300 hover:bg-indigo hover:text-bg ${className}`}
    >
      {children}
    </a>
  )
}
