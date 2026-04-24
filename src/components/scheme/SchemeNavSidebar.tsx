'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { SchemeRow } from '@/types/database'
import { createSchemeAction, deleteSchemeAction, updateSchemeAction } from '@/app/actions/schemes'
import CreateSchemeModal from './CreateSchemeModal'

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
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTargetId(null) }}
          onKeyDown={(e) => { if (e.key === 'Escape') setDeleteTargetId(null) }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 24,
              width: 320,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>
              Удалить схему?
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              Это действие нельзя отменить.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteTargetId(null)}
                style={{
                  padding: '6px 14px',
                  fontSize: 12.5,
                  border: '1px solid var(--border)',
                  borderRadius: 5,
                  background: 'none',
                  color: 'var(--text-2)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(deleteTargetId)}
                disabled={isPending}
                style={{
                  padding: '6px 14px',
                  fontSize: 12.5,
                  border: 'none',
                  borderRadius: 5,
                  background: 'var(--err)',
                  color: '#fff',
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <nav
        style={{
          width: collapsed ? 32 : 220,
          minWidth: collapsed ? 32 : 220,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          transition: 'width .22s cubic-bezier(.4,0,.2,1), min-width .22s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid var(--border)',
            flexShrink: 0,
            height: 38,
            overflow: 'hidden',
          }}
        >
          {!collapsed && (
            <Link
              href="/dashboard"
              style={{
                flex: 1,
                fontSize: 11,
                color: 'var(--text-3)',
                textDecoration: 'none',
                padding: '0 8px 0 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                transition: 'color .15s',
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--accent)')}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--text-3)')}
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
            style={{
              width: 32,
              minWidth: 32,
              height: 38,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-3)',
              background: 'none',
              border: 'none',
              ...(collapsed ? { position: 'absolute', top: 3, left: 0 } : {}),
            }}
          >
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: 5,
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Project name */}
            <div
              style={{
                padding: '10px 12px 6px',
                fontSize: 12,
                fontWeight: 500,
                color: 'var(--text-1)',
                borderBottom: '1px solid var(--border-light)',
                flexShrink: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {projectName}
            </div>

            {/* Schemes list */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '.08em',
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  padding: '4px 12px 4px',
                }}
              >
                Схемы
              </div>

              {schemes.length === 0 ? (
                <div
                  style={{
                    padding: '16px 12px',
                    fontSize: 12,
                    color: 'var(--text-3)',
                    textAlign: 'center',
                  }}
                >
                  Нет схем
                </div>
              ) : (
                schemes.map((scheme) => {
                  const href = `/projects/${projectId}/schemes/${scheme.id}`
                  const isActive = pathname === href
                  const showActions = hoveredId === scheme.id || menuOpenId === scheme.id

                  if (renamingId === scheme.id) {
                    return (
                      <div key={scheme.id} style={{ padding: '1px 4px' }}>
                        <input
                          autoFocus
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') { e.preventDefault(); confirmRename(scheme.id) }
                            if (e.key === 'Escape') setRenamingId(null)
                          }}
                          onBlur={() => setRenamingId(null)}
                          style={{
                            width: '100%',
                            height: 26,
                            padding: '0 8px',
                            fontSize: 12,
                            border: '1px solid var(--accent)',
                            borderRadius: 3,
                            background: 'var(--bg)',
                            color: 'var(--text-1)',
                            fontFamily: 'inherit',
                            outline: 'none',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    )
                  }

                  return (
                    <div
                      key={scheme.id}
                      style={{ position: 'relative', margin: '1px 4px' }}
                      onMouseEnter={() => setHoveredId(scheme.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <Link
                        href={href}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          height: 26,
                          paddingLeft: 8,
                          paddingRight: showActions ? 28 : 8,
                          borderRadius: 3,
                          textDecoration: 'none',
                          background: isActive
                            ? 'var(--accent-bg)'
                            : showActions
                            ? 'var(--bg)'
                            : 'transparent',
                          transition: 'background .1s',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 10,
                            color: isActive ? 'var(--accent)' : 'var(--text-3)',
                            flexShrink: 0,
                          }}
                        >
                          ⊞
                        </span>
                        <span
                          style={{
                            fontSize: 12,
                            color: isActive ? 'var(--accent)' : 'var(--text-1)',
                            fontWeight: isActive ? 500 : 300,
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
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
                          style={{
                            position: 'absolute',
                            right: 4,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: 20,
                            height: 20,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background:
                              menuOpenId === scheme.id ? 'var(--border)' : 'transparent',
                            border: 'none',
                            borderRadius: 3,
                            cursor: 'pointer',
                            color: 'var(--text-2)',
                            padding: 0,
                            transition: 'background .1s',
                          }}
                          onMouseEnter={(e) => {
                            if (menuOpenId !== scheme.id)
                              (e.currentTarget as HTMLElement).style.background =
                                'var(--border-light)'
                          }}
                          onMouseLeave={(e) => {
                            if (menuOpenId !== scheme.id)
                              (e.currentTarget as HTMLElement).style.background = 'transparent'
                          }}
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
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: '100%',
                            zIndex: 200,
                            background: 'var(--surface)',
                            border: '1px solid var(--border)',
                            borderRadius: 5,
                            boxShadow: '0 4px 12px rgba(0,0,0,.1)',
                            minWidth: 150,
                            overflow: 'hidden',
                            padding: '2px 0',
                          }}
                        >
                          {(
                            [
                              {
                                label: 'Переименовать',
                                action: () => startRename(scheme),
                              },
                              {
                                label: 'Изменить',
                                action: () => {
                                  router.push(href)
                                  setMenuOpenId(null)
                                },
                              },
                              {
                                label: 'Удалить',
                                danger: true,
                                action: () => {
                                  setDeleteTargetId(scheme.id)
                                  setMenuOpenId(null)
                                },
                              },
                            ] as const
                          ).map((item) => (
                            <button
                              key={item.label}
                              onClick={item.action}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '6px 12px',
                                fontSize: 12,
                                color: 'danger' in item && item.danger ? 'var(--err)' : 'var(--text-1)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                display: 'block',
                              }}
                              onMouseEnter={(e) => {
                                ;(e.currentTarget as HTMLElement).style.background = 'var(--bg)'
                              }}
                              onMouseLeave={(e) => {
                                ;(e.currentTarget as HTMLElement).style.background = 'none'
                              }}
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
            <div
              style={{
                padding: '8px',
                borderTop: '1px solid var(--border-light)',
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => setShowModal(true)}
                disabled={isPending}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '5px 8px',
                  fontSize: 12,
                  color: isPending ? 'var(--text-3)' : 'var(--text-2)',
                  background: 'none',
                  border: '1px dashed var(--border)',
                  borderRadius: 4,
                  cursor: isPending ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'color .15s, border-color .15s',
                }}
                onMouseEnter={(e) => {
                  if (!isPending) {
                    const el = e.currentTarget as HTMLElement
                    el.style.color = 'var(--accent)'
                    el.style.borderColor = 'var(--accent)'
                  }
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement
                  el.style.color = 'var(--text-2)'
                  el.style.borderColor = 'var(--border)'
                }}
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
