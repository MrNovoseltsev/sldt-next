'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ProjectRow } from '@/types/database'

const MODES = [
  { id: 'all', label: 'Все объекты' },
  { id: 'active', label: 'Активные' },
  { id: 'service', label: 'Обслуживание' },
  { id: 'archive', label: 'Списание' },
] as const

type Tab = 'nav' | 'fav'
type ModeId = (typeof MODES)[number]['id']

interface SidebarProps {
  projects: ProjectRow[]
}

export default function Sidebar({ projects }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [tab, setTab] = useState<Tab>('nav')
  const [mode, setMode] = useState<ModeId>('all')
  const pathname = usePathname()

  return (
    <nav
      style={{
        width: collapsed ? 32 : 240,
        minWidth: collapsed ? 32 : 240,
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
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
          overflow: 'hidden',
        }}
      >
        {!collapsed && (
          <div style={{ display: 'flex', flex: 1, padding: '0 8px' }}>
            {(['nav', 'fav'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: tab === t ? 'var(--accent)' : 'var(--text-2)',
                  padding: '10px 8px',
                  borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  borderBottomWidth: 2,
                  borderBottomStyle: 'solid',
                  borderBottomColor: tab === t ? 'var(--accent)' : 'transparent',
                  transition: 'color .15s, border-color .15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {t === 'nav' ? 'Навигация' : 'Избранное'}
              </button>
            ))}
          </div>
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
        <>
          {tab === 'nav' && (
            <>
              {/* Mode filters */}
              <div
                style={{
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  borderBottom: '1px solid var(--border-light)',
                  flexShrink: 0,
                }}
              >
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    style={{
                      fontSize: 12,
                      color: mode === m.id ? 'var(--accent)' : 'var(--text-2)',
                      background: mode === m.id ? 'var(--accent-bg)' : 'none',
                      fontWeight: mode === m.id ? 500 : 300,
                      padding: '5px 8px',
                      borderRadius: 4,
                      textAlign: 'left',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'background .15s, color .15s',
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: 'currentColor',
                        flexShrink: 0,
                      }}
                    />
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Project tree */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: '.08em',
                    color: 'var(--text-3)',
                    textTransform: 'uppercase',
                    padding: '12px 12px 4px',
                  }}
                >
                  Проекты
                </div>

                {projects.length === 0 ? (
                  <div
                    style={{
                      padding: '24px 12px',
                      textAlign: 'center',
                      fontSize: 12,
                      color: 'var(--text-3)',
                    }}
                  >
                    Нет проектов
                  </div>
                ) : (
                  projects.map((project) => {
                    const isActive = pathname === `/projects/${project.id}`
                    return (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          height: 26,
                          padding: '0 8px 0 12px',
                          margin: '1px 4px',
                          borderRadius: 3,
                          textDecoration: 'none',
                          background: isActive ? 'var(--accent-bg)' : 'transparent',
                          transition: 'background .1s',
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive)
                            (e.currentTarget as HTMLElement).style.background = 'var(--bg)'
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive)
                            (e.currentTarget as HTMLElement).style.background = 'transparent'
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            color: isActive ? 'var(--accent)' : 'var(--text-3)',
                            flexShrink: 0,
                          }}
                        >
                          ◈
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
                          {project.name}
                        </span>
                      </Link>
                    )
                  })
                )}
              </div>
            </>
          )}

          {tab === 'fav' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '.08em',
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  padding: '12px 12px 4px',
                }}
              >
                Быстрый доступ
              </div>
              <div
                style={{
                  padding: '24px 12px',
                  textAlign: 'center',
                  fontSize: 12,
                  color: 'var(--text-3)',
                }}
              >
                Нет избранного
              </div>
            </div>
          )}
        </>
      )}
    </nav>
  )
}
