'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import type { SchemeRow } from '@/types/database'
import { createSchemeAction } from '@/app/actions/schemes'

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
  const [isPending, startTransition] = useTransition()

  const handleCreate = () => {
    startTransition(async () => {
      const { data, error } = await createSchemeAction(projectId)
      if (error || !data) return
      router.push(`/projects/${projectId}/schemes/${data.id}`)
      router.refresh()
    })
  }

  return (
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
            Все проекты
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
                return (
                  <Link
                    key={scheme.id}
                    href={href}
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
              onClick={handleCreate}
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
  )
}
