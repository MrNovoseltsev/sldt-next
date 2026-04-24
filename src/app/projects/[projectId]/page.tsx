import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSchemesByProject } from '@/lib/supabase/queries'
import EmptyProjectState from '@/components/scheme/EmptyProjectState'

interface ProjectPageProps {
  params: Promise<{ projectId: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params
  const supabase = await createClient()
  const { data: schemes } = await getSchemesByProject(supabase, projectId)

  if (schemes && schemes.length > 0) {
    redirect(`/projects/${projectId}/schemes/${schemes[0].id}`)
  }

  return <EmptyProjectState projectId={projectId} />
}
