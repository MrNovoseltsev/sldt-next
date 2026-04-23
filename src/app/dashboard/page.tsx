import { createClient } from '@/lib/supabase/server'
import { getProjects } from '@/lib/supabase/queries'
import ProjectsView from '@/components/projects/ProjectsView'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: projects } = await getProjects(supabase)

  return <ProjectsView projects={projects ?? []} />
}
