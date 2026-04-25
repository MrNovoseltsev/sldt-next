'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMockData } from '@/lib/mock-db/MockDataContext'
import CreateSchemeModal from './CreateSchemeModal'
import { cn } from '@/lib/utils'

interface EmptyProjectStateProps {
  projectId: string
}

export default function EmptyProjectState({ projectId }: EmptyProjectStateProps) {
  const router = useRouter()
  const { createScheme } = useMockData()
  const [showModal, setShowModal] = useState(false)

  const handleCreate = (name: string) => {
    const { data, error } = createScheme({ project_id: projectId, device_name: name || null })
    if (error || !data) return
    setShowModal(false)
    router.push(`/scheme?projectId=${projectId}&schemeId=${data.id}`)
  }

  return (
    <>
      {showModal && <CreateSchemeModal onConfirm={handleCreate} onClose={() => setShowModal(false)} />}
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <button
          onClick={() => setShowModal(true)}
          title="Создать схему"
          className={cn(
            'w-24 h-24 rounded-2xl border-2 border-dashed border-border bg-transparent flex items-center justify-center text-[var(--text-3)] outline-none transition-colors duration-150',
            'cursor-pointer hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-accent',
          )}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <span className="text-[13px] text-[var(--text-3)]">Создать схему</span>
      </div>
    </>
  )
}
