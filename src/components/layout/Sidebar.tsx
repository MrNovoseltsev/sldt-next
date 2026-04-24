'use client'

import { useState, useTransition, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation';
import type { ProjectRow } from '@/types/database'
import type { SidebarProject, SidebarLocation, SidebarScheme } from '@/types/sidebar';
import { deleteProjectAction, updateProjectAction } from '@/app/actions/projects';
import ProjectFormDialog from '@/components/projects/ProjectFormDialog'

// const MODES = [
//   { id: 'all', label: 'Все объекты' },
//   { id: 'active', label: 'Активные' },
//   { id: 'service', label: 'Обслуживание' },
//   { id: 'archive', label: 'Списание' },
// ] as const

type Tab = 'nav' | 'fav'
// type ModeId = (typeof MODES)[number]['id']

interface SidebarProps {
  projectTree: SidebarProject[];
}

// ── Toggle button ─────────────────────────────────────────────────────────────

function ToggleBtn({ expanded, onToggle }: { expanded: boolean; onToggle: (e: React.MouseEvent) => void; }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 14, height: 14, flexShrink: 0,
        border: '1px solid var(--border)', borderRadius: 2,
        background: 'var(--surface)', color: 'var(--text-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, lineHeight: 1, cursor: 'pointer',
        fontFamily: 'var(--font-mono, monospace)',
        appearance: 'none' as React.CSSProperties['appearance'],
        padding: 0, outline: 'none',
        transition: 'background .12s, border-color .12s',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = 'var(--text-2)';
        el.style.background = 'var(--bg)';
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLButtonElement;
        el.style.borderColor = 'var(--border)';
        el.style.background = 'var(--surface)';
      }}
    >
      {expanded ? '−' : '+'}
    </button>
  );
}

const toggleSpace = <span style={{ width: 14, flexShrink: 0, display: 'inline-block' }} />;

// ── Scheme node ───────────────────────────────────────────────────────────────

function SchemeNode({ scheme, projectId, pathname }: {
  scheme: SidebarScheme; projectId: string; pathname: string;
}) {
  const href = `/projects/${projectId}/schemes/${scheme.id}`;
  const isActive = pathname === href;
  return (
    <div style={{ position: 'relative' }}>
      <Link
        href={href}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 26, padding: '0 8px', margin: '1px 4px',
          borderRadius: 3, textDecoration: 'none',
          background: isActive ? 'var(--accent-bg)' : 'transparent',
          transition: 'background .1s',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--bg)';
        }}
        onMouseLeave={(e) => {
          if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
        }}
      >
        <span style={{ position: 'absolute', left: -7, top: '50%', width: 7, height: 1, background: 'var(--border-light)', display: 'block', pointerEvents: 'none' }} />
        {toggleSpace}
        <span style={{
          fontSize: 12,
          color: isActive ? 'var(--accent)' : 'var(--text-1)',
          fontWeight: isActive ? 500 : 300,
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {scheme.device_name ?? 'Без названия'}
        </span>
      </Link>
    </div>
  );
}

// ── Location node ─────────────────────────────────────────────────────────────

function LocationNode({ location, projectId, locationKey, pathname, expanded, onToggle }: {
  location: SidebarLocation; projectId: string; locationKey: string;
  pathname: string; expanded: Record<string, boolean>; onToggle: (id: string) => void;
}) {
  const isExp = !!expanded[locationKey];
  const isChildActive = location.schemes.some(
    (s) => pathname === `/projects/${projectId}/schemes/${s.id}`
  );
  return (
    <>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 26, cursor: 'pointer', padding: '0 8px', margin: '1px 4px',
          borderRadius: 3, position: 'relative',
          background: isChildActive && !isExp ? 'var(--accent-bg)' : 'transparent',
          transition: 'background .1s',
        }}
        onClick={() => onToggle(locationKey)}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            isChildActive && !isExp ? 'var(--accent-bg)' : 'var(--bg)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background =
            isChildActive && !isExp ? 'var(--accent-bg)' : 'transparent';
        }}
      >
        <span style={{ position: 'absolute', left: -7, top: '50%', width: 7, height: 1, background: 'var(--border-light)', display: 'block', pointerEvents: 'none' }} />
        <ToggleBtn expanded={isExp} onToggle={(e) => { e.stopPropagation(); onToggle(locationKey); }} />
        <span style={{
          fontSize: 12, color: 'var(--text-1)', fontWeight: 300,
          flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {location.name ?? 'Без расположения'}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>
          ({location.schemes.length})
        </span>
      </div>
      {isExp && (
        <div style={{ marginLeft: 15, borderLeft: '1px solid var(--border-light)' }}>
          {location.schemes.map((scheme) => (
            <SchemeNode key={scheme.id} scheme={scheme} projectId={projectId} pathname={pathname} />
          ))}
        </div>
      )}
    </>
  );
}

// ── Project node ──────────────────────────────────────────────────────────────

interface ProjectNodeProps {
  project: SidebarProject;
  pathname: string;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  menuOpenId: string | null;
  setMenuOpenId: (id: string | null) => void;
  renamingId: string | null;
  renameValue: string;
  setRenameValue: (v: string) => void;
  onStartRename: (project: ProjectRow) => void;
  onConfirmRename: (projectId: string) => void;
  onCancelRename: () => void;
  onEdit: (project: ProjectRow) => void;
  onDelete: (projectId: string) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

function ProjectNode({
  project, pathname, expanded, onToggle,
  hoveredId, setHoveredId, menuOpenId, setMenuOpenId,
  renamingId, renameValue, setRenameValue,
  onStartRename, onConfirmRename, onCancelRename,
  onEdit, onDelete, menuRef,
  isFavorited, onToggleFavorite,
}: ProjectNodeProps) {
  const schemeCount = project.locations.reduce((acc, loc) => acc + loc.schemes.length, 0);
  const hasChildren = schemeCount > 0;
  const isExp = !!expanded[project.id];
  const isActive = pathname?.startsWith(`/projects/${project.id}`);
  const showActions = hoveredId === project.id || menuOpenId === project.id;

  // Flat mode: single null-name location → show schemes directly without location level
  const isFlatMode = project.locations.length === 1 && project.locations[0].name === null;

  return (
    <div
      onMouseEnter={() => setHoveredId(project.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      {renamingId === project.id ? (
        <div style={{ margin: '1px 4px' }}>
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); onConfirmRename(project.id); }
              if (e.key === 'Escape') onCancelRename();
            }}
            onBlur={onCancelRename}
            style={{
              width: '100%', height: 26, padding: '0 8px', fontSize: 12,
              border: '1px solid var(--accent)', borderRadius: 3,
              background: 'var(--bg)', color: 'var(--text-1)',
              fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      ) : (
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            height: 26, cursor: hasChildren ? 'pointer' : 'default',
            padding: '0 8px', paddingRight: showActions ? 28 : 8,
            margin: '1px 4px', borderRadius: 3, position: 'relative',
            background: isActive && !isExp ? 'var(--accent-bg)' : 'transparent',
            transition: 'background .1s',
          }}
          onClick={() => { if (hasChildren) onToggle(project.id); }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              isActive && !isExp ? 'var(--accent-bg)' : 'var(--bg)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              isActive && !isExp ? 'var(--accent-bg)' : 'transparent';
          }}
        >
          {hasChildren
            ? <ToggleBtn expanded={isExp} onToggle={(e) => { e.stopPropagation(); onToggle(project.id); }} />
            : toggleSpace
          }
          <span style={{
            fontSize: 12,
            color: isActive ? 'var(--accent)' : 'var(--text-1)',
            fontWeight: isActive ? 500 : 300,
            flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {project.name}
          </span>
          {schemeCount > 0 && (
            <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>
              ({schemeCount})
            </span>
          )}

          {showActions && (
            <button
              onClick={(e) => {
                e.preventDefault(); e.stopPropagation();
                setMenuOpenId(menuOpenId === project.id ? null : project.id);
              }}
              style={{
                position: 'absolute', right: 4, top: '50%',
                transform: 'translateY(-50%)',
                width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: menuOpenId === project.id ? 'var(--border)' : 'transparent',
                border: 'none', borderRadius: 3, cursor: 'pointer',
                color: 'var(--text-2)', padding: 0, transition: 'background .1s',
              }}
              onMouseEnter={(e) => {
                if (menuOpenId !== project.id)
                  (e.currentTarget as HTMLElement).style.background = 'var(--border-light)';
              }}
              onMouseLeave={(e) => {
                if (menuOpenId !== project.id)
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
              }}
            >
              <svg width="3" height="13" viewBox="0 0 3 13" fill="currentColor">
                <circle cx="1.5" cy="1.5" r="1.5" />
                <circle cx="1.5" cy="6.5" r="1.5" />
                <circle cx="1.5" cy="11.5" r="1.5" />
              </svg>
            </button>
          )}

          {menuOpenId === project.id && (
            <div
              ref={menuRef}
              style={{
                position: 'absolute', right: 0, top: '100%', zIndex: 200,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 5, boxShadow: '0 4px 12px rgba(0,0,0,.1)',
                minWidth: 150, overflow: 'hidden', padding: '2px 0',
              }}
            >
              {([
                { label: isFavorited ? 'Убрать из избранного' : 'Добавить в избранное', action: onToggleFavorite },
                { label: 'Переименовать', action: () => onStartRename(project) },
                { label: 'Изменить', action: () => onEdit(project) },
                { label: 'Удалить', danger: true, action: () => onDelete(project.id) },
              ] as { label: string; action: () => void; danger?: boolean }[]).map((item) => (
                <button
                  key={item.label}
                  onClick={item.action}
                  style={{
                    width: '100%', textAlign: 'left', padding: '6px 12px', fontSize: 12,
                    color: 'danger' in item && item.danger ? 'var(--err)' : 'var(--text-1)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: 'inherit', display: 'block',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--bg)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'none'; }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isExp && hasChildren && (
        <div style={{ marginLeft: 15, borderLeft: '1px solid var(--border-light)' }}>
          {isFlatMode
            ? project.locations[0].schemes.map((scheme) => (
              <SchemeNode key={scheme.id} scheme={scheme} projectId={project.id} pathname={pathname} />
            ))
            : project.locations.map((loc) => {
              const locKey = `${project.id}:loc:${loc.name ?? ''}`;
              return (
                <LocationNode
                  key={locKey}
                  location={loc}
                  projectId={project.id}
                  locationKey={locKey}
                  pathname={pathname}
                  expanded={expanded}
                  onToggle={onToggle}
                />
              );
            })
          }
        </div>
      )}
    </div>
  );
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────

export default function Sidebar({ projectTree }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [tab, setTab] = useState<Tab>('nav')
  // const [mode, setMode] = useState<ModeId>('all')
  const pathname = usePathname()
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const stored = localStorage.getItem('sidebar-favorites');
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch { return new Set(); }
  });

  const toggleFavorite = (projectId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId); else next.add(projectId);
      try { localStorage.setItem('sidebar-favorites', JSON.stringify([...next])); } catch {}
      return next;
    });
    setMenuOpenId(null);
  };

  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [editTarget, setEditTarget] = useState<ProjectRow | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  const initialExpanded = useMemo(() => {
    const state: Record<string, boolean> = {};
    const schemeMatch = pathname?.match(/^\/projects\/([^/]+)\/schemes\/([^/]+)/);
    if (schemeMatch) {
      const [, projectId, schemeId] = schemeMatch;
      state[projectId] = true;
      for (const project of projectTree) {
        if (project.id !== projectId) continue;
        for (const loc of project.locations) {
          if (loc.schemes.some((s) => s.id === schemeId)) {
            state[`${projectId}:loc:${loc.name ?? ''}`] = true;
          }
        }
      }
    } else {
      const projMatch = pathname?.match(/^\/projects\/([^/]+)/);
      if (projMatch) state[projMatch[1]] = true;
    }
    return state;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [expanded, setExpanded] = useState<Record<string, boolean>>(initialExpanded);
  const toggleExpanded = (id: string) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  useEffect(() => {
    if (!menuOpenId) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpenId]);

  const startRename = (project: ProjectRow) => {
    setRenamingId(project.id);
    setRenameValue(project.name);
    setMenuOpenId(null);
  };

  const confirmRename = (projectId: string) => {
    const trimmed = renameValue.trim();
    setRenamingId(null);
    if (!trimmed) return;
    startTransition(async () => {
      await updateProjectAction(projectId, { name: trimmed });
      router.refresh();
    });
  };

  const handleDelete = (projectId: string) => {
    const isActive = pathname?.startsWith(`/projects/${projectId}`);
    setDeleteTargetId(null);
    startTransition(async () => {
      await deleteProjectAction(projectId);
      if (isActive) router.push('/dashboard');
      router.refresh();
    });
  }

  return (
    <>
      {editTarget && (
        <ProjectFormDialog
          mode="edit"
          project={editTarget}
          open={!!editTarget}
          onOpenChange={(open) => { if (!open) setEditTarget(null); }}
          onSuccess={() => { setEditTarget(null); router.refresh(); }}
        />
      )}

      {deleteTargetId && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTargetId(null); }}
          onKeyDown={(e) => { if (e.key === 'Escape') setDeleteTargetId(null); }}
        >
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: 24, width: 320,
            display: 'flex', flexDirection: 'column', gap: 16,
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-1)' }}>Удалить объект?</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)' }}>
              Все схемы объекта будут удалены. Это действие нельзя отменить.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteTargetId(null)}
                style={{
                  padding: '6px 14px', fontSize: 12.5,
                  border: '1px solid var(--border)', borderRadius: 5,
                  background: 'none', color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                Отмена
              </button>
              <button
                onClick={() => handleDelete(deleteTargetId)}
                style={{
                  padding: '6px 14px', fontSize: 12.5, border: 'none', borderRadius: 5,
                  background: 'var(--err)', color: '#fff', cursor: 'pointer',
                  fontFamily: 'inherit', fontWeight: 500,
                }}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}

      <nav style={{
        width: collapsed ? 32 : 240, minWidth: collapsed ? 32 : 240,
        background: 'var(--surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', position: 'relative', flexShrink: 0,
        transition: 'width .22s cubic-bezier(.4,0,.2,1), min-width .22s cubic-bezier(.4,0,.2,1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0, overflow: 'hidden',
        }}>
          {!collapsed && (
            <div style={{ display: 'flex', flex: 1, padding: '0 8px' }}>
              {(['nav', 'fav'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    fontSize: 12, fontWeight: 500,
                    color: tab === t ? 'var(--accent)' : 'var(--text-2)',
                    padding: '10px 8px', cursor: 'pointer',
                    background: 'none', border: 'none',
                    borderBottomWidth: 2, borderBottomStyle: 'solid',
                    borderBottomColor: tab === t ? 'var(--accent)' : 'transparent',
                    transition: 'color .15s, border-color .15s', whiteSpace: 'nowrap',
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
              width: 32, minWidth: 32, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-3)', background: 'none', border: 'none',
              ...(collapsed ? { position: 'absolute', top: 3, left: 0 } : {}),
            }}
          >
            <span style={{
              width: 20, height: 20, borderRadius: 5,
              border: '1px solid var(--border)', background: 'var(--bg)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="8" height="12" viewBox="0 0 8 12" fill="none"
                style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform .22s' }}>
                <path d="M2 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>

        {!collapsed && (
          <>
            {tab === 'nav' && (
              <>
                {/* Mode filters */}
                {/* <div style={{
                  padding: 8, display: 'flex', flexDirection: 'column', gap: 1,
                  borderBottom: '1px solid var(--border-light)', flexShrink: 0,
                }}>
                  {MODES.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMode(m.id)}
                      style={{
                        fontSize: 12,
                        color: mode === m.id ? 'var(--accent)' : 'var(--text-2)',
                        background: mode === m.id ? 'var(--accent-bg)' : 'none',
                        fontWeight: mode === m.id ? 500 : 300,
                        padding: '5px 8px', borderRadius: 4, textAlign: 'left',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                        transition: 'background .15s, color .15s',
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', flexShrink: 0 }} />
                      {m.label}
                    </button>
                  ))}
                </div> */}

                {/* Project tree */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                  <div style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
                    color: 'var(--text-3)', textTransform: 'uppercase', padding: '12px 12px 4px',
                  }}>
                    Объекты
                  </div>

                  {projectTree.length === 0 ? (
                    <div style={{ padding: '24px 12px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
                      Нет объектов
                    </div>
                  ) : (
                      projectTree.map((project) => (
                        <ProjectNode
                          key={project.id}
                          project={project}
                          pathname={pathname ?? ''}
                          expanded={expanded}
                          onToggle={toggleExpanded}
                          hoveredId={hoveredId}
                          setHoveredId={setHoveredId}
                          menuOpenId={menuOpenId}
                          setMenuOpenId={setMenuOpenId}
                          renamingId={renamingId}
                          renameValue={renameValue}
                          setRenameValue={setRenameValue}
                          onStartRename={startRename}
                          onConfirmRename={confirmRename}
                          onCancelRename={() => setRenamingId(null)}
                          onEdit={(p) => { setEditTarget(p); setMenuOpenId(null); }}
                          onDelete={(id) => { setDeleteTargetId(id); setMenuOpenId(null); }}
                          menuRef={menuRef}
                          isFavorited={favorites.has(project.id)}
                          onToggleFavorite={() => toggleFavorite(project.id)}
                        />
                      ))
                  )}
                </div>
              </>
            )}

            {tab === 'fav' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                <div style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '.08em',
                  color: 'var(--text-3)', textTransform: 'uppercase', padding: '12px 12px 4px',
                }}>
                  Избранное
                </div>
                {projectTree.filter((p) => favorites.has(p.id)).length === 0 ? (
                  <div style={{ padding: '24px 12px', textAlign: 'center', fontSize: 12, color: 'var(--text-3)' }}>
                    Нет избранного
                  </div>
                ) : (
                  projectTree.filter((p) => favorites.has(p.id)).map((project) => (
                    <ProjectNode
                      key={project.id}
                      project={project}
                      pathname={pathname ?? ''}
                      expanded={expanded}
                      onToggle={toggleExpanded}
                      hoveredId={hoveredId}
                      setHoveredId={setHoveredId}
                      menuOpenId={menuOpenId}
                      setMenuOpenId={setMenuOpenId}
                      renamingId={renamingId}
                      renameValue={renameValue}
                      setRenameValue={setRenameValue}
                      onStartRename={startRename}
                      onConfirmRename={confirmRename}
                      onCancelRename={() => setRenamingId(null)}
                      onEdit={(p) => { setEditTarget(p); setMenuOpenId(null); }}
                      onDelete={(id) => { setDeleteTargetId(id); setMenuOpenId(null); }}
                      menuRef={menuRef}
                      isFavorited={true}
                      onToggleFavorite={() => toggleFavorite(project.id)}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </nav>
    </>
  )
}
