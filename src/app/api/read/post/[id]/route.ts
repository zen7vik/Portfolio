import { postDoc } from '@/lib/reader'

export const revalidate = 86400

export async function GET(_req: Request, { params }: RouteContext<'/api/read/post/[id]'>) {
  const doc = await postDoc((await params).id)
  return doc ? Response.json(doc) : Response.json({ error: 'not found' }, { status: 404 })
}
