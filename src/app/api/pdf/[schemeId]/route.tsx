import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { getScheme, getSchemeLines, getProject } from '@/lib/supabase/queries'
import SchemePdf from '@/components/pdf/SchemePdf'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ schemeId: string }> },
) {
  const { schemeId } = await params
  const supabase = await createClient()

  const [{ data: scheme }, { data: lines }] = await Promise.all([
    getScheme(supabase, schemeId),
    getSchemeLines(supabase, schemeId),
  ])

  if (!scheme) {
    return new Response('Схема не найдена', { status: 404 })
  }

  const { data: project } = await getProject(supabase, scheme.project_id)
  if (!project) {
    return new Response('Объект не найден', { status: 404 })
  }

  const buffer = await renderToBuffer(
    <SchemePdf scheme={scheme} lines={lines ?? []} project={project} />,
  )

  const filename = encodeURIComponent(scheme.device_name ?? 'scheme')

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
