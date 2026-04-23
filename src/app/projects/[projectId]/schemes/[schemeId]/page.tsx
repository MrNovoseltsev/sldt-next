import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getScheme, getSchemeLines, getProject } from '@/lib/supabase/queries'
import SchemeEditor from '@/components/scheme/SchemeEditor'

interface SchemePageProps {
  params: Promise<{ projectId: string; schemeId: string }>
}

export default async function SchemePage({ params }: SchemePageProps) {
  const { projectId, schemeId } = await params
  const supabase = await createClient()

  const [{ data: scheme }, { data: lines }, { data: project }] = await Promise.all([
    getScheme(supabase, schemeId),
    getSchemeLines(supabase, schemeId),
    getProject(supabase, projectId),
  ])

  if (!scheme || !project) notFound()

  return (
    <SchemeEditor
      scheme={scheme}
      lines={lines ?? []}
      projectId={projectId}
      projectName={project.name}
    />
  )
}
