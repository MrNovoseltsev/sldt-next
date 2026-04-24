'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { SchemeRow } from '@/types/database'
import { createSchemeAction, deleteSchemeAction, updateSchemeAction } from '@/app/actions/schemes'
import CreateSchemeModal from './CreateSchemeModal'
import { cn } from '@/lib/utils'

interface SchemeNavSidebarProps {
  projectId: string
  projectName: string
  schemes: SchemeRow[]
}

export default function SchemeNavSidebar({
  projectId,
  projectName,
  schemes,
}: SchemeNavSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null)

  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpenId) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpenId])

  const handleCreate = (name: string) => {
    startTransition(async () => {
      const { data, error } = await createSchemeAction(projectId, name)
      if (error || !data) return
      setShowModal(false)
      router.push(`/projects/${projectId}/schemes/${data.id}`)
      router.refresh()
    })
  }

  const startRename = (scheme: SchemeRow) => {
    setRenamingId(scheme.id)
    setRenameValue(scheme.device_name ?? '')
    setMenuOpenId(null)
  }

  const confirmRename = (schemeId: string) => {
    const trimmed = renameValue.trim()
    setRenamingId(null)
    if (!trimmed) return
    startTransition(async () => {
      await updateSchemeAction(schemeId, projectId, { device_name: trimmed })
      router.refresh()
    })
  }

  const handleDelete = (schemeId: string) => {
    const href = `/projects/${projectId}/schemes/${schemeId}`
    const isActive = pathname === href
    setDeleteTargetId(null)
    startTransition(async () => {
      await deleteSchemeAction(schemeId, projectId)
      if (isActive) router.push(`/projects/${projectId}`)
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

      {deleteTargetId && (
        <div
          className="fixed inset-0 bg-black/45 flex items-center justify-center z-[1000]"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTargetId(null) }}
          onKeyDown={(e) => { if (e.key === 'Escape') setDeleteTargetId(null) }}
        >
          <div className="bg-[var(--surface)] border border-border rounded-lg p-6 w-[320px] flex flex-col gap-4">
            <div className="text-sm font-medium text-foreground">
              Удалить схему?
            </div>
            <div className="text-[13px] text-muted-foreground">
              Это действие нельзя отменить.
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-[14px] py-[6px] text-[12.5px] border border-border rounded-[5px] bg-transparent text-muted-foreground cursor-pointer font-[inherit]"
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(deleteTargetId)}
                disabled={isPending}
                className={cn(
                  'px-[14px] py-[6px] text-[12.5px] border-none rounded-[5px] text-white font-medium font-[inherit]',
                  isPending ? 'bg-[var(--text-3)] cursor-not-allowed' : 'bg-destructive cursor-pointer',
                )}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        className="bg-[var(--surface)] border-r border-border flex flex-col overflow-hidden relative shrink-0"
        style={{
          width: collapsed ? 32 : 220,
          minWidth: collapsed ? 32 : 220,
          transition: 'width .22s cubic-bezier(.4,0,.2,1), min-width .22s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center border-b border-border shrink-0 h-[38px] overflow-hidden">
          {!collapsed && (
            <Link
              href="/dashboard"
              className="flex-1 text-[11px] text-[var(--text-3)] no-underline px-2 pl-3 flex items-center gap-1 whitespace-nowrap overflow-hidden transition-colors hover:text-[var(--accent)]"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M7 2L3 5l4 3"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Все объекты
            </Link>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            title={collapsed ? 'Развернуть панель' : 'Свернуть панель'}
            className={cn(
              'w-8 min-w-[32px] h-[38px] flex items-center justify-center cursor-pointer text-[var(--text-3)] bg-transparent border-none',
              collapsed && 'absolute top-[3px] left-0',
            )}
          >
            <span className="w-5 h-5 rounded-[5px] border border-border bg-[var(--bg)] flex items-center justify-center">
              <svg
                width="8"
                height="12"
                viewBox="0 0 8 12"
                fill="none"
                style={{
                  transform: collapsed ? 'none' : 'rotate(180deg)',
                  transition: 'transform .22s',
                }}
              >
                <path
                  d="M2 1l5 5-5 5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </button>
        </div>

        {!collapsed && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Project name */}
            <div className="px-3 pt-[10px] pb-[6px] text-xs font-medium text-foreground border-b border-[var(--border-light)] shrink-0 overflow-hidden text-ellipsis whitespace-nowrap">
              {projectName}
            </div>

            {/* Schemes list */}
            <div className="flex-1 overflow-y-auto py-2">
              <div className="text-[10px] font-semibold tracking-[.08em] text-[var(--text-3)] uppercase px-3 py-1">
                Схемы
              </div>

              {schemes.length === 0 ? (
                <div className="px-3 py-4 text-xs text-[var(--text-3)] text-center">
                  Нет схем
                </div>
              ) : (
                schemes.map((scheme) => {
                  const href = `/projects/${projectId}/schemes/${scheme.id}`
                  const isActive = pathname === href
                  const showActions = hoveredId === scheme.id || menuOpenId === scheme.id

                  if (renamingId === scheme.id) {
                    return (
                      <div key={scheme.id} className="py-px px-1">
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); confirmRename(scheme.id) }
                            if (e.key === 'Escape') setRenamingId(null)
                          }}
                          onBlur={() => setRenamingId(null)}
                          className="w-full h-[26px] px-2 text-xs border border-[var(--accent)] rounded-[3px] bg-[var(--bg)] text-foreground font-[inherit] outline-none box-border"
                        />
                      </div>
                    )
                  }

                  return (
                    <div
                      key={scheme.id}
                      className="relative my-px mx-1"
                      onMouseEnter={() => setHoveredId(scheme.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <Link
                        href={href}
                        className={cn(
                          'flex items-center gap-1.5 h-[26px] pl-2 rounded-[3px] no-underline transition-colors duration-100',
                          isActive ? 'bg-accent pr-2' : showActions ? 'bg-[var(--bg)] pr-7' : 'bg-transparent pr-2',
                        )}
                      >
                        <span className={cn('text-[10px] shrink-0', isActive ? 'text-[var(--accent)]' : 'text-[var(--text-3)]')}>
                          ⊞
                        </span>
                        <span className={cn(
                          'text-xs flex-1 overflow-hidden text-ellipsis whitespace-nowrap',
                          isActive ? 'text-[var(--accent)] font-medium' : 'text-foreground font-light',
                        )}>
                          {scheme.device_name ?? 'Без названия'}
                        </span>
                      </Link>

                      {showActions && (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setMenuOpenId(menuOpenId === scheme.id ? null : scheme.id)
                          }}
                          className={cn(
                            'absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center border-none rounded-[3px] cursor-pointer text-muted-foreground p-0 transition-colors duration-100',
                            menuOpenId === scheme.id ? 'bg-border' : 'bg-transparent hover:bg-[var(--border-light)]',
                          )}
                        >
                          <svg width="3" height="13" viewBox="0 0 3 13" fill="currentColor">
                            <circle cx="1.5" cy="1.5" r="1.5" />
                            <circle cx="1.5" cy="6.5" r="1.5" />
                            <circle cx="1.5" cy="11.5" r="1.5" />
                          </svg>
                        </button>
                      )}

                      {menuOpenId === scheme.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-0 top-full z-[200] bg-[var(--surface)] border border-border rounded-[5px] shadow-[0_4px_12px_rgba(0,0,0,.1)] min-w-[150px] overflow-hidden py-0.5"
                        >
                          {(
                            [
                              { label: 'Переименовать', action: () => startRename(scheme) },
                              { label: 'Изменить', action: () => { router.push(href); setMenuOpenId(null) } },
                              { label: 'Удалить', danger: true, action: () => { setDeleteTargetId(scheme.id); setMenuOpenId(null) } },
                            ] as const
                          ).map((item) => (
                            <button
                              key={item.label}
                              onClick={item.action}
                              className={cn(
                                'w-full text-left px-3 py-[6px] text-xs bg-transparent border-none cursor-pointer font-[inherit] block transition-colors hover:bg-[var(--bg)]',
                                'danger' in item && item.danger ? 'text-destructive' : 'text-foreground',
                              )}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>

            {/* Create scheme button */}
            <div className="p-2 border-t border-[var(--border-light)] shrink-0">
              <button
                onClick={() => setShowModal(true)}
                disabled={isPending}
                className={cn(
                  'w-full flex items-center gap-1.5 px-2 py-[5px] text-xs border border-dashed border-border rounded-[4px] bg-transparent font-[inherit] transition-colors duration-150',
                  isPending
                    ? 'text-[var(--text-3)] cursor-not-allowed'
                    : 'text-muted-foreground cursor-pointer hover:text-[var(--accent)] hover:border-[var(--accent)]',
                )}
              >
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M8 2v12M2 8h12" />
                </svg>
                {isPending ? 'Создание…' : 'Создать схему'}
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
