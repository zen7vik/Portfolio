'use client'

import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { setScene } from '@/components/scene/sceneStore'
import { prefersReducedMotion } from '@/lib/motion'

type TransitionLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function TransitionLink({ href, children, className, onMouseEnter, onMouseLeave }: TransitionLinkProps) {
  const router = useRouter()

  const navigate = (e: React.MouseEvent) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return
    e.preventDefault()
    if (prefersReducedMotion()) {
      router.push(href)
      return
    }
    setScene({ burst: 1.4 })
    const root = document.getElementById('page-root')
    gsap.to(root, {
      autoAlpha: 0,
      duration: 0.35,
      ease: 'power2.in',
      onComplete: () => {
        router.push(href)
        requestAnimationFrame(() => {
          window.scrollTo(0, 0)
          ScrollTrigger.refresh()
          gsap.fromTo(root, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, ease: 'power2.out', delay: 0.1 })
        })
      },
    })
  }

  return (
    <a href={href} onClick={navigate} className={className} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </a>
  )
}
