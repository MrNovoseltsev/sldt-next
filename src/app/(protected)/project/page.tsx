'use client'

import { Suspense, useEffect, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMockData } from '@/lib/mock-db/MockDataContext'
import SchemeNavSidebar from '@/components/scheme/SchemeNavSidebar'
import EmptyProjectState from '@/components/scheme/EmptyProjectState'

function ProjectPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('id') ?? ''
  const { getProject, getSchemesByProject } = useMockData()

  const project = projectId ? getProject(projectId) : null
  const schemes = useMemo(
    () => (projectId ? getSchemesByProject(projectId) : []),
    [projectId, getSchemesByProject],
  )
  const firstSchemeId = schemes[0]?.id

  useEffect(() => {
    if (!projectId) {
      router.replace('/dashboard')
      return
    }
    if (project && firstSchemeId) {
      router.replace(`/scheme?projectId=${projectId}&schemeId=${firstSchemeId}`)
    }
  }, [projectId, project, firstSchemeId, router])

  if (!projectId) return null

  if (!project) {
    return (
      <div className="flex flex-1 items-center justify-center text-[13px] text-[var(--text-3)]">
        Объект не найден
      </div>
    )
  }

  if (schemes.length > 0) return null

  return (
    <div className="flex flex-1 overflow-hidden">
      <SchemeNavSidebar projectId={projectId} projectName={project.name} schemes={schemes} />
      <main className="flex-1 overflow-auto bg-[var(--bg)]">
        <EmptyProjectState projectId={projectId} />
      </main>
    </div>
  )
}

export default function ProjectPage() {
  return (
    <Suspense fallback={null}>
      <ProjectPageInner />
    </Suspense>
  )
}
