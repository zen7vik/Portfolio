import { site } from '@/lib/site'

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-6xl font-bold tracking-tight">{site.name}</h1>
        <p className="mt-4 text-muted">{site.tagline}</p>
      </div>
    </main>
  )
}
