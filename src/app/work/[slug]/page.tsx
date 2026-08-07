import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import CaseLayout from '@/components/case/CaseLayout'
import Scrolly from '@/components/case/Scrolly'
import { getAllCases, getCase } from '@/lib/content'

const ACCENTS = { indigo: '#7c8cff', green: '#58c48f', amber: '#f0b35e', rose: '#f27a8a' } as const

export function generateStaticParams() {
  return getAllCases().map((c) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: PageProps<'/work/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  try {
    const { meta } = getCase(slug)
    const title = `${meta.title}, Satvik Singh`
    return {
      title,
      description: meta.hook,
      openGraph: { title, description: meta.hook, type: 'article', images: [{ url: '/og.png', width: 1200, height: 630 }] },
      twitter: { card: 'summary_large_image', title, description: meta.hook, images: ['/og.png'] },
    }
  } catch {
    return {}
  }
}

export default async function CasePage({ params }: PageProps<'/work/[slug]'>) {
  const { slug } = await params
  const all = getAllCases()
  const idx = all.findIndex((c) => c.slug === slug)
  if (idx === -1) notFound()

  const { meta, body } = getCase(slug)
  const accent = ACCENTS[meta.accent]

  return (
    <CaseLayout meta={meta} prev={all[idx - 1] ?? null} next={all[idx + 1] ?? null}>
      <MDXRemote
        source={body}
        components={{
          Scrolly: (props: { case: string }) => <Scrolly case={props.case} accent={accent} />,
          h2: (props) => (
            <h2
              className="mt-16 mb-6 font-display text-2xl font-bold tracking-tight md:text-3xl"
              {...props}
            />
          ),
          p: (props) => <p className="my-5 max-w-3xl text-lg leading-relaxed text-muted" {...props} />,
          ul: (props) => <ul className="my-5 max-w-3xl space-y-3" {...props} />,
          li: (props) => (
            <li className="ml-5 list-disc text-lg leading-relaxed text-muted marker:text-indigo" {...props} />
          ),
          strong: (props) => <strong className="font-semibold text-fg" {...props} />,
          em: (props) => <em {...props} />,
          code: (props) => (
            <code className="rounded bg-fg/10 px-1.5 py-0.5 font-mono text-sm text-fg" {...props} />
          ),
        }}
      />
    </CaseLayout>
  )
}
