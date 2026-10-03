import Link from 'next/link'
import { ArrowLeft } from '@phosphor-icons/react/dist/ssr'
import ReadingProgress from '@/components/ui/ReadingProgress'
import ThemeToggle from '@/components/ui/ThemeToggle'
import { site } from '@/lib/site'

/** Shared top bar for every page in read mode. `back` adds a "Back to..." link to the right section of /read. */
export default function ReadHeader({ back, progress = false }: { back?: { href: string; label: string }; progress?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur-md">
      <nav className="relative mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-3 px-5 md:px-8">
        <div className="flex min-w-0 items-center gap-4">
          {back ? (
            <Link href={back.href} className="group inline-flex min-w-0 items-center gap-2 text-[0.95rem] font-semibold text-fg">
              <ArrowLeft size={16} weight="bold" className="shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5" />
              <span className="truncate">{back.label}</span>
            </Link>
          ) : (
            <Link href="/read" className="text-[0.98rem] font-bold tracking-tight text-fg">
              Satvik Singh
            </Link>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-[0.88rem] font-semibold">
          <ThemeToggle />
          <a href={site.resumePath} download className="hidden rounded-full px-3.5 py-2 text-fg hover:bg-fg/[0.06] sm:inline-block">
            Resume
          </a>
          <Link href="/" className="rounded-full bg-fg px-4 py-2 text-bg transition-transform hover:-translate-y-0.5">
            Enter the room
          </Link>
        </div>
      </nav>
      {progress && <ReadingProgress />}
    </header>
  )
}
