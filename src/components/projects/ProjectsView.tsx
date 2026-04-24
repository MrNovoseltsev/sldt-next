'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ProjectRow } from '@/types/database'
import ProjectFormDialog from './ProjectFormDialog'
import { deleteProjectAction } from '@/app/actions/projects'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

type DialogState =
  | { type: 'none' }
  | { type: 'create' }
  | { type: 'edit'; project: ProjectRow }
  | { type: 'delete'; project: ProjectRow }

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })
}

const IconDotsVertical = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="3" r="1.3"/>
    <circle cx="8" cy="8" r="1.3"/>
    <circle cx="8" cy="13" r="1.3"/>
  </svg>
)

const IconEdit = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 2l3 3-9 9H2v-3L11 2z"/>
  </svg>
)

const IconTrash = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4h12M6 4V2h4v2M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4"/>
  </svg>
)

const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M8 2v12M2 8h12"/>
  </svg>
)

const IconSearch = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 13A6 6 0 107 1a6 6 0 000 12zM13 13l2 2"/>
  </svg>
)

interface ProjectsViewProps {
  projects: ProjectRow[]
}

export default function ProjectsView({ projects }: ProjectsViewProps) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [isDeleting, startDelete] = useTransition()
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<{ id: string; top: number; left: number } | null>(null)

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || (p.customer ?? '').toLowerCase().includes(q)
  })

  const closeDialog = () => {
    setDialog({ type: 'none' })
    setDeleteError(null)
  }

  const handleMutationSuccess = () => {
    closeDialog()
    router.refresh()
  }

  useEffect(() => {
    if (menuOpen === null) return
    const close = () => setMenuOpen(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  const handleDelete = () => {
    if (dialog.type !== 'delete') return
    const id = dialog.project.id
    setDeleteError(null)
    startDelete(async () => {
      const { error } = await deleteProjectAction(id)
      if (error) {
        setDeleteError(error)
        return
      }
      closeDialog()
      router.refresh()
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Section header */}
      <div
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0 20px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-1)' }}>Объекты</div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 1 }}>
            {projects.length === 0
              ? 'Нет объектов'
              : `${projects.length} ${projects.length === 1 ? 'объект' : projects.length < 5 ? 'объекта' : 'объектов'}`}
          </div>
        </div>
        <button
          onClick={() => setDialog({ type: 'create' })}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'var(--accent)',
            color: '#fff',
            border: 'none',
            borderRadius: 5,
            padding: '6px 12px',
            fontSize: 12.5,
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'background .15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--accent)')}
        >
          <IconPlus />
          Создать объект
        </button>
      </div>

      {/* Toolbar */}
      <div
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0 20px',
          height: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            border: '1px solid var(--border)',
            borderRadius: 4,
            padding: '4px 9px',
            background: 'var(--bg)',
            maxWidth: 240,
            flex: 1,
            transition: 'border-color .15s',
          }}
          onFocusCapture={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
          onBlurCapture={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          <IconSearch />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по объектам…"
            style={{
              border: 'none',
              background: 'none',
              outline: 'none',
              fontSize: 12,
              color: 'var(--text-1)',
              width: '100%',
              fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {projects.length === 0 ? (
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
            <div style={{ fontSize: 13 }}>Нет объектов</div>
            <button
              onClick={() => setDialog({ type: 'create' })}
              style={{
                fontSize: 12,
                color: 'var(--accent)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textDecoration: 'underline',
              }}
            >
              Создать первый объект
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border)',
                  background: 'var(--surface)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                }}
              >
                {(['НАЗВАНИЕ', 'ЗАКАЗЧИК', 'ОБНОВЛЕНО'] as const).map((label, i) => (
                  <th
                    key={label}
                    style={{
                      padding: i === 0 ? '0 12px 0 28px' : '0 12px',
                      height: 34,
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'var(--text-2)',
                      letterSpacing: '.05em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      borderRight: i < 2 ? '1px solid var(--border-light)' : 'none',
                      userSelect: 'none',
                      width: i < 2 ? '50%' : undefined,
                    }}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    style={{
                      textAlign: 'center',
                      color: 'var(--text-3)',
                      padding: '32px 0',
                      fontSize: 13,
                    }}
                  >
                    Ничего не найдено
                  </td>
                </tr>
              ) : (
                filtered.map((project) => {
                  const isHovered = hoveredRow === project.id
                  const isMenuOpen = menuOpen?.id === project.id
                  const showDots = isHovered || isMenuOpen

                  return (
                    <tr
                      key={project.id}
                      onClick={() => router.push(`/projects/${project.id}`)}
                      onMouseEnter={() => setHoveredRow(project.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        borderBottom: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        background: isHovered || isMenuOpen ? '#f4f3f0' : 'transparent',
                        transition: 'background .1s',
                        position: 'relative',
                      }}
                    >
                      <td
                        style={{
                          padding: '0 12px 0 28px',
                          height: 38,
                          fontSize: 12.5,
                          fontWeight: 500,
                          color: 'var(--text-1)',
                          borderRight: '1px solid var(--border-light)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          position: 'relative',
                        }}
                      >
                        <div
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            left: 4,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            opacity: showDots ? 1 : 0,
                            pointerEvents: showDots ? 'auto' : 'none',
                            transition: 'opacity .1s',
                          }}
                        >
                          <button
                            onClick={(e) => {
                              if (isMenuOpen) {
                                setMenuOpen(null)
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect()
                                setMenuOpen({ id: project.id, top: rect.bottom + 4, left: rect.left })
                              }
                            }}
                            style={{
                              width: 20,
                              height: 20,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 3,
                              border: 'none',
                              background: isMenuOpen ? 'var(--border)' : 'none',
                              color: 'var(--text-2)',
                              cursor: 'pointer',
                              padding: 0,
                              transition: 'background .1s',
                            }}
                            onMouseEnter={(e) => {
                              if (!isMenuOpen)
                                (e.currentTarget as HTMLElement).style.background = 'var(--border-light)'
                            }}
                            onMouseLeave={(e) => {
                              if (!isMenuOpen)
                                (e.currentTarget as HTMLElement).style.background = 'none'
                            }}
                          >
                            <IconDotsVertical />
                          </button>
                        </div>

                        {project.name}
                      </td>
                      <td
                        style={{
                          padding: '0 12px',
                          height: 38,
                          fontSize: 12.5,
                          color: project.customer ? 'var(--text-1)' : 'var(--text-3)',
                          borderRight: '1px solid var(--border-light)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {project.customer ?? '—'}
                      </td>
                      <td
                        style={{
                          padding: '0 12px',
                          height: 38,
                          fontSize: 12,
                          color: 'var(--text-2)',
                          whiteSpace: 'nowrap',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        {formatDate(project.updated_at)}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Context menu — fixed to viewport to escape table stacking context */}
      {menuOpen && (() => {
        const project = projects.find((p) => p.id === menuOpen.id)
        if (!project) return null
        return (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: menuOpen.top,
              left: menuOpen.left,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              boxShadow: '0 4px 12px rgba(0,0,0,.12)',
              zIndex: 9999,
              minWidth: 148,
              padding: '3px 0',
            }}
          >
            <button
              onClick={() => {
                setMenuOpen(null)
                setDialog({ type: 'edit', project })
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 12px',
                fontSize: 12.5,
                color: 'var(--text-1)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'background .1s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--bg)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
            >
              <IconEdit />
              Редактировать
            </button>
            <button
              onClick={() => {
                setMenuOpen(null)
                setDialog({ type: 'delete', project })
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 12px',
                fontSize: 12.5,
                color: 'var(--err)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                transition: 'background .1s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--err-bg)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'none')}
            >
              <IconTrash />
              Удалить
            </button>
          </div>
        )
      })()}

      {/* Create / Edit dialog */}
      {(dialog.type === 'create' || dialog.type === 'edit') && (
        <ProjectFormDialog
          mode={dialog.type}
          project={dialog.type === 'edit' ? dialog.project : undefined}
          open={true}
          onOpenChange={(open) => { if (!open) closeDialog() }}
          onSuccess={handleMutationSuccess}
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={dialog.type === 'delete'} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent style={{ maxWidth: 380 }}>
          <DialogHeader>
            <DialogTitle style={{ fontSize: 14, fontWeight: 600 }}>Удалить объект</DialogTitle>
          </DialogHeader>
          <div style={{ fontSize: 13, color: 'var(--text-2)', padding: '4px 0 16px', lineHeight: 1.5 }}>
            Удалить объект{' '}
            <strong style={{ color: 'var(--text-1)' }}>
              «{dialog.type === 'delete' ? dialog.project.name : ''}»
            </strong>
            ? Это действие необратимо — все схемы внутри объекта будут удалены.
          </div>
          {deleteError && (
            <div
              style={{
                fontSize: 12,
                color: 'var(--err)',
                background: 'var(--err-bg)',
                padding: '7px 10px',
                borderRadius: 5,
                marginBottom: 12,
              }}
            >
              {deleteError}
            </div>
          )}
          <DialogFooter style={{ gap: 8 }}>
            <button
              onClick={closeDialog}
              disabled={isDeleting}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 5,
                padding: '6px 14px',
                fontSize: 12,
                color: 'var(--text-2)',
                background: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Отмена
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              style={{
                background: isDeleting ? 'var(--text-3)' : 'var(--err)',
                color: '#fff',
                border: 'none',
                borderRadius: 5,
                padding: '6px 16px',
                fontSize: 12,
                fontWeight: 500,
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'background .15s',
              }}
            >
              {isDeleting ? 'Удаление…' : 'Удалить'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
