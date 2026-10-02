import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import ReadingProgress from '@/components/ui/ReadingProgress'
import ThemeToggle from '@/components/ui/ThemeToggle'

export default function SubNav({ back, label }: { back: string; label: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-xl">
      <nav className="relative mx-auto flex h-16 max-w-[1320px] items-center justify-between px-5 md:px-10">
        <Link href={back} className="group inline-flex items-center gap-2 text-[0.95rem] font-medium text-fg">
          <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
          Satvik Singh
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted sm:inline">{label}</span>
          <ThemeToggle />
        </div>
      </nav>
      <ReadingProgress />
    </header>
  )
}
