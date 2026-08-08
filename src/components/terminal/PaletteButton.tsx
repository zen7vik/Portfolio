'use client'

export default function PaletteButton() {
  return (
    <button
      aria-label="Search (⌘K)"
      title="Search (⌘K)"
      onClick={() => window.dispatchEvent(new CustomEvent('open-palette'))}
      className="text-muted transition-colors hover:text-fg"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.5" y2="16.5" />
      </svg>
    </button>
  )
}
