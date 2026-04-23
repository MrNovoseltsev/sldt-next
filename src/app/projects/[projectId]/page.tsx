import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSchemesByProject } from '@/lib/supabase/queries'

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

  // No schemes yet — show empty state (sidebar has "Create scheme" button)
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 12,
        color: 'var(--text-3)',
      }}
    >
      <div style={{ fontSize: 32 }}>⊞</div>
      <div style={{ fontSize: 13 }}>Нет схем</div>
      <div style={{ fontSize: 12 }}>Создайте первую схему в панели слева</div>
    </div>
  )
}
