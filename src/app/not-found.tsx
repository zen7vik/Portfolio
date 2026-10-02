import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-[1320px] flex-col justify-center px-5 md:px-10">
      <p className="tabular font-mono text-sm text-accent">404</p>
      <h1 className="display mt-5 max-w-3xl text-[clamp(2.8rem,7vw,5.6rem)] text-fg">This page is down. The rest is fine.</h1>
      <Link
        href="/"
        className="mt-10 inline-flex h-12 w-fit items-center rounded-full bg-accent px-6 text-[0.95rem] font-semibold text-on-accent transition-transform hover:-translate-y-0.5"
      >
        Back home
      </Link>
    </main>
  )
}
