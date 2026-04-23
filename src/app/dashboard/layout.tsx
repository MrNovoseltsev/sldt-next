import Topbar from '@/components/layout/Topbar'
import Sidebar from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { getProjects } from '@/lib/supabase/queries'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: projects } = await getProjects(supabase)

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar projects={projects ?? []} />
        <main className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
