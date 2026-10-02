import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { MDXRemote } from 'next-mdx-remote/rsc'
import CaseLayout from '@/components/case/CaseLayout'
import Scrolly from '@/components/case/Scrolly'
import { getAllCases, getCase } from '@/lib/content'

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

  return (
    <CaseLayout meta={meta} prev={all[idx - 1] ?? null} next={all[idx + 1] ?? null}>
      <MDXRemote
        source={body}
        components={{
          Scrolly: (props: { case: string }) => <Scrolly case={props.case} />,
          h2: (props) => (
            <h2 className="display-tight mb-6 mt-20 max-w-[46rem] text-[clamp(1.7rem,3vw,2.4rem)] text-fg" {...props} />
          ),
          p: (props) => <p className="my-5 max-w-[46rem] text-[1.1rem] leading-[1.75] text-fg-2" {...props} />,
          ul: (props) => <ul className="my-6 max-w-[46rem] space-y-4" {...props} />,
          ol: (props) => <ol className="my-6 max-w-[46rem] list-decimal space-y-3 pl-6 marker:text-muted" {...props} />,
          li: (props) => (
            <li
              className="relative pl-6 text-[1.1rem] leading-[1.7] text-fg-2 before:absolute before:left-0 before:top-[0.85em] before:h-px before:w-3 before:bg-accent [ol_&]:pl-1 [ol_&]:before:hidden"
              {...props}
            />
          ),
          strong: (props) => <strong className="font-semibold text-fg" {...props} />,
          em: (props) => <em {...props} />,
          code: (props) => <code className="rounded bg-raised px-1.5 py-0.5 font-mono text-[0.9em] text-fg" {...props} />,
        }}
      />
    </CaseLayout>
  )
}
