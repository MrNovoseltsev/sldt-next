'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMockData } from '@/lib/mock-db/MockDataContext'
import SchemeNavSidebar from '@/components/scheme/SchemeNavSidebar'
import SchemeEditor from '@/components/scheme/SchemeEditor'

function SchemePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const projectId = searchParams.get('projectId') ?? ''
  const schemeId = searchParams.get('schemeId') ?? ''
  const { getProject, getScheme, getSchemesByProject, getSchemeLines } = useMockData()

  const project = projectId ? getProject(projectId) : null
  const scheme = schemeId ? getScheme(schemeId) : null
  const schemes = projectId ? getSchemesByProject(projectId) : []
  const lines = schemeId ? getSchemeLines(schemeId) : []

  useEffect(() => {
    if (!projectId || !schemeId) {
      router.replace('/dashboard')
    }
  }, [projectId, schemeId, router])

  if (!projectId || !schemeId) return null

  if (!project || !scheme) {
    return (
      <div className="flex flex-1 items-center justify-center text-[13px] text-[var(--text-3)]">
        Схема не найдена
      </div>
    )
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      <SchemeNavSidebar projectId={projectId} projectName={project.name} schemes={schemes} />
      <main className="flex-1 overflow-auto bg-[var(--bg)]">
        <SchemeEditor scheme={scheme} lines={lines} project={project} />
      </main>
    </div>
  )
}

export default function SchemePage() {
  return (
    <Suspense fallback={null}>
      <SchemePageInner />
    </Suspense>
  )
}
