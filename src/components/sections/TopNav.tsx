import PaletteButton from '@/components/terminal/PaletteButton'

const links = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#personal', label: 'Personal' },
  { href: '#writing', label: 'Writing' },
  { href: '#contact', label: 'Contact' },
]

export default function TopNav() {
  return (
    <nav className="fixed inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 md:px-16">
        <a href="#hero" className="font-mono text-sm lowercase tracking-wide text-muted transition-colors hover:text-fg">
          satvik
        </a>
        <div className="flex items-center gap-7 font-mono text-xs uppercase tracking-widest text-muted">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hidden transition-colors hover:text-fg md:inline">
              {l.label}
            </a>
          ))}
          <PaletteButton />
        </div>
      </div>
    </nav>
  )
}
