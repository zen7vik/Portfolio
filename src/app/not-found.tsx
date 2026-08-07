import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-sm text-indigo">404</p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight md:text-6xl">This route fell over.</h1>
      <p className="mt-4 text-muted">Unlike my systems, this page doesn't exist.</p>
      <Link
        href="/"
        className="mt-10 rounded-full border border-indigo px-6 py-3 font-mono text-sm uppercase tracking-widest transition-colors hover:bg-indigo hover:text-bg"
      >
        Back home
      </Link>
    </main>
  )
}
