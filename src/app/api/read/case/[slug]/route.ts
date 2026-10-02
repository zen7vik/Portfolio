import { getAllCases } from '@/lib/content'
import { caseDoc } from '@/lib/reader'

export const dynamic = 'force-static'

export async function GET(_req: Request, { params }: RouteContext<'/api/read/case/[slug]'>) {
  const doc = caseDoc((await params).slug)
  return doc ? Response.json(doc) : Response.json({ error: 'not found' }, { status: 404 })
}

export function generateStaticParams() {
  return getAllCases().map((c) => ({ slug: c.slug }))
}
