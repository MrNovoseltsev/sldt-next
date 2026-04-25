'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { ProjectRow } from '@/types/database'
import { useMockData } from '@/lib/mock-db/MockDataContext'
import ProjectFormDialog from './ProjectFormDialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

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
    <circle cx="8" cy="3" r="1.3" />
    <circle cx="8" cy="8" r="1.3" />
    <circle cx="8" cy="13" r="1.3" />
  </svg>
)
const IconEdit = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 2l3 3-9 9H2v-3L11 2z" />
  </svg>
)
const IconTrash = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4h12M6 4V2h4v2M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" />
  </svg>
)
const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M8 2v12M2 8h12" />
  </svg>
)
const IconSearch = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 13A6 6 0 107 1a6 6 0 000 12zM13 13l2 2" />
  </svg>
)

export default function ProjectsView() {
  const router = useRouter()
  const { getProjects, deleteProject } = useMockData()
  const projects = getProjects()

  const [search, setSearch] = useState('')
  const [dialog, setDialog] = useState<DialogState>({ type: 'none' })
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState<{ id: string; top: number; left: number } | null>(null)

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || (p.customer ?? '').toLowerCase().includes(q)
  })

  const closeDialog = () => setDialog({ type: 'none' })

  useEffect(() => {
    if (menuOpen === null) return
    const close = () => setMenuOpen(null)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  const handleDelete = () => {
    if (dialog.type !== 'delete') return
    deleteProject(dialog.project.id)
    closeDialog()
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="bg-[var(--surface)] border-b border-border px-5 h-[52px] flex items-center gap-3 shrink-0">
        <div className="flex-1">
          <div className="text-[15px] font-semibold text-foreground">Объекты</div>
          <div className="text-xs text-muted-foreground mt-px">
            {projects.length === 0
              ? 'Нет объектов'
              : `${projects.length} ${projects.length === 1 ? 'объект' : projects.length < 5 ? 'объекта' : 'объектов'}`}
          </div>
        </div>
        <button
          onClick={() => setDialog({ type: 'create' })}
          className="flex items-center gap-1.5 bg-[var(--accent)] text-white border-none rounded-[5px] px-3 py-[6px] text-[12.5px] font-medium font-[inherit] cursor-pointer whitespace-nowrap transition-colors hover:bg-[var(--accent-hover)]"
        >
          <IconPlus />
          Создать объект
        </button>
      </div>

      <div className="bg-[var(--surface)] border-b border-border px-5 h-[40px] flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1.5 border border-border rounded-[4px] px-[9px] py-1 bg-[var(--bg)] max-w-[240px] flex-1 focus-within:border-[var(--accent)] transition-colors">
          <IconSearch />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по объектам…"
            className="border-none bg-transparent outline-none text-xs text-foreground w-full font-[inherit]"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-[var(--text-3)]">
            <div className="text-[13px]">Нет объектов</div>
            <button
              onClick={() => setDialog({ type: 'create' })}
              className="text-xs text-[var(--accent)] bg-transparent border-none cursor-pointer font-[inherit] underline"
            >
              Создать первый объект
            </button>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-[var(--surface)] sticky top-0 z-[10]">
                {(['НАЗВАНИЕ', 'ЗАКАЗЧИК', 'ОБНОВЛЕНО'] as const).map((label, i) => (
                  <th
                    key={label}
                    className={cn(
                      'h-[34px] text-left text-[11px] font-semibold text-muted-foreground tracking-[.05em] uppercase whitespace-nowrap select-none',
                      i === 0 ? 'pl-7 pr-3' : 'px-3',
                      i < 2 ? 'border-r border-[var(--border-light)] w-1/2' : '',
                    )}
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-[var(--text-3)] py-8 text-[13px]">
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
                      onClick={() => router.push(`/project?id=${project.id}`)}
                      onMouseEnter={() => setHoveredRow(project.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      className={cn(
                        'border-b border-[var(--border-light)] cursor-pointer transition-colors duration-100',
                        isHovered || isMenuOpen ? 'bg-[#f4f3f0]' : 'bg-transparent',
                      )}
                    >
                      <td className="pl-7 pr-3 h-[38px] text-[12.5px] font-medium text-foreground border-r border-[var(--border-light)] whitespace-nowrap overflow-hidden text-ellipsis relative">
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className={cn(
                            'absolute left-1 top-1/2 -translate-y-1/2 transition-opacity duration-100',
                            showDots ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
                          )}
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
                            className={cn(
                              'w-5 h-5 flex items-center justify-center rounded-[3px] border-none text-muted-foreground cursor-pointer p-0 transition-colors',
                              isMenuOpen ? 'bg-border' : 'bg-transparent hover:bg-[var(--border-light)]',
                            )}
                          >
                            <IconDotsVertical />
                          </button>
                        </div>
                        {project.name}
                      </td>
                      <td
                        className={cn(
                          'px-3 h-[38px] text-[12.5px] border-r border-[var(--border-light)] whitespace-nowrap',
                          project.customer ? 'text-foreground' : 'text-[var(--text-3)]',
                        )}
                      >
                        {project.customer ?? '—'}
                      </td>
                      <td className="px-3 h-[38px] text-xs text-muted-foreground whitespace-nowrap font-mono">
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

      {menuOpen &&
        (() => {
          const project = projects.find((p) => p.id === menuOpen.id)
          if (!project) return null
          return (
            <div
              onClick={(e) => e.stopPropagation()}
              className="fixed bg-[var(--surface)] border border-border rounded-[6px] shadow-[0_4px_12px_rgba(0,0,0,.12)] z-[9999] min-w-[148px] py-[3px]"
              style={{ top: menuOpen.top, left: menuOpen.left }}
            >
              <button
                onClick={() => {
                  setMenuOpen(null)
                  setDialog({ type: 'edit', project })
                }}
                className="w-full flex items-center gap-2 px-3 py-[7px] text-[12.5px] text-foreground bg-transparent border-none cursor-pointer font-[inherit] text-left transition-colors hover:bg-[var(--bg)]"
              >
                <IconEdit />
                Редактировать
              </button>
              <button
                onClick={() => {
                  setMenuOpen(null)
                  setDialog({ type: 'delete', project })
                }}
                className="w-full flex items-center gap-2 px-3 py-[7px] text-[12.5px] text-destructive bg-transparent border-none cursor-pointer font-[inherit] text-left transition-colors hover:bg-[var(--err-bg)]"
              >
                <IconTrash />
                Удалить
              </button>
            </div>
          )
        })()}

      {(dialog.type === 'create' || dialog.type === 'edit') && (
        <ProjectFormDialog
          mode={dialog.type}
          project={dialog.type === 'edit' ? dialog.project : undefined}
          open={true}
          onOpenChange={(open) => {
            if (!open) closeDialog()
          }}
          onSuccess={closeDialog}
        />
      )}

      <Dialog
        open={dialog.type === 'delete'}
        onOpenChange={(open) => {
          if (!open) closeDialog()
        }}
      >
        <DialogContent className="max-w-[380px]">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold">Удалить объект</DialogTitle>
          </DialogHeader>
          <div className="text-[13px] text-muted-foreground py-1 pb-4 leading-[1.5]">
            Удалить объект{' '}
            <strong className="text-foreground">«{dialog.type === 'delete' ? dialog.project.name : ''}»</strong>?
            Это действие необратимо — все схемы внутри объекта будут удалены.
          </div>
          <DialogFooter className="gap-2">
            <button
              onClick={closeDialog}
              className="border border-border rounded-[5px] px-[14px] py-[6px] text-xs text-muted-foreground bg-transparent cursor-pointer font-[inherit]"
            >
              Отмена
            </button>
            <button
              onClick={handleDelete}
              className="border-none rounded-[5px] px-[16px] py-[6px] text-xs text-white font-medium font-[inherit] transition-colors bg-destructive cursor-pointer"
            >
              Удалить
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
