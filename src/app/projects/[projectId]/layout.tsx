import { notFound } from 'next/navigation'
import Topbar from '@/components/layout/Topbar'
import { createClient } from '@/lib/supabase/server'
import { getProject, getSchemesByProject } from '@/lib/supabase/queries'
import SchemeNavSidebar from '@/components/scheme/SchemeNavSidebar'

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{ projectId: string }>
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { projectId } = await params
  const supabase = await createClient()

  const [{ data: project }, { data: schemes }] = await Promise.all([
    getProject(supabase, projectId),
    getSchemesByProject(supabase, projectId),
  ])

  if (!project) notFound()

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <SchemeNavSidebar
          projectId={projectId}
          projectName={project.name}
          schemes={schemes ?? []}
        />
        <main className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
