'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createSchemeAction } from '@/app/actions/schemes'
import CreateSchemeModal from './CreateSchemeModal'

interface EmptyProjectStateProps {
  projectId: string
}

export default function EmptyProjectState({ projectId }: EmptyProjectStateProps) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleCreate = (name: string) => {
    startTransition(async () => {
      const { data, error } = await createSchemeAction(projectId, name)
      if (error || !data) return
      setShowModal(false)
      router.push(`/projects/${projectId}/schemes/${data.id}`)
      router.refresh()
    })
  }

  return (
    <>
    {showModal && (
      <CreateSchemeModal
        onConfirm={handleCreate}
        onClose={() => setShowModal(false)}
        isPending={isPending}
      />
    )}
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 16,
      }}
    >
      <button
        onClick={() => setShowModal(true)}
        disabled={isPending}
        title="Создать схему"
        style={{
          width: 96,
          height: 96,
          borderRadius: 16,
          border: '2px dashed var(--border)',
          background: 'transparent',
          cursor: isPending ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-3)',
          transition: 'border-color .15s, color .15s, background .15s',
          outline: 'none',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.borderColor = 'var(--accent)'
          el.style.color = 'var(--accent)'
          el.style.background = 'var(--accent-subtle, rgba(99,102,241,.06))'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.borderColor = 'var(--border)'
          el.style.color = 'var(--text-3)'
          el.style.background = 'transparent'
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <span style={{ fontSize: 13, color: 'var(--text-3)' }}>
        {isPending ? 'Создание…' : 'Создать схему'}
      </span>
    </div>
    </>
  )
}
