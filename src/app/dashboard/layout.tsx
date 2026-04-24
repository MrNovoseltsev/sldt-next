import Topbar from '@/components/layout/Topbar'
import Sidebar from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { getProjects, getAllSchemesSummary } from '@/lib/supabase/queries'
import type { SidebarProject } from '@/types/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const [{ data: projects }, { data: schemesSummary }] = await Promise.all([
    getProjects(supabase),
    getAllSchemesSummary(supabase),
  ])

  const projectTree: SidebarProject[] = (projects ?? []).map((project) => {
    const projectSchemes = (schemesSummary ?? []).filter((s) => s.project_id === project.id)

    const hasAnyLocation = projectSchemes.some((s) => s.installation_location)

    let locations: SidebarProject['locations']

    if (!hasAnyLocation) {
      // All schemes have no location — show flat (single null-name group)
      locations = projectSchemes.length > 0
        ? [{ name: null, schemes: projectSchemes.map((s) => ({ id: s.id, device_name: s.device_name })) }]
        : []
    } else {
      // Group by installation_location
      const locationMap = new Map<string, { id: string; device_name: string | null }[]>()
      for (const scheme of projectSchemes) {
        const key = scheme.installation_location ?? ''
        if (!locationMap.has(key)) locationMap.set(key, [])
        locationMap.get(key)!.push({ id: scheme.id, device_name: scheme.device_name })
      }
      locations = Array.from(locationMap.entries()).map(([name, schemes]) => ({
        name: name || null,
        schemes,
      }))
    }

    return { ...project, locations }
  })

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar projectTree={projectTree} />
        <main className="flex-1 overflow-auto" style={{ background: 'var(--bg)' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
