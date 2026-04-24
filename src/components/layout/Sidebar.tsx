'use client'

import { useState, useTransition, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation';
import type { ProjectRow } from '@/types/database'
import type { SidebarProject, SidebarLocation, SidebarScheme } from '@/types/sidebar';
import { deleteProjectAction, updateProjectAction } from '@/app/actions/projects';
import ProjectFormDialog from '@/components/projects/ProjectFormDialog'
import { cn } from '@/lib/utils'

type Tab = 'nav' | 'fav'

interface SidebarProps {
  projectTree: SidebarProject[];
}

// ── Toggle button ─────────────────────────────────────────────────────────────

function ToggleBtn({ expanded, onToggle }: { expanded: boolean; onToggle: (e: React.MouseEvent) => void; }) {
  return (
    <button
      onClick={onToggle}
      className="w-[14px] h-[14px] shrink-0 border border-border rounded-[2px] bg-[var(--surface)] text-muted-foreground flex items-center justify-center text-[11px] leading-none cursor-pointer p-0 outline-none transition-colors hover:border-[var(--text-2)] hover:bg-[var(--bg)]"
    >
      {expanded ? '−' : '+'}
    </button>
  );
}

const toggleSpace = <span className="w-[14px] shrink-0 inline-block" />;

// ── Scheme node ───────────────────────────────────────────────────────────────

function SchemeNode({ scheme, projectId, pathname }: {
  scheme: SidebarScheme; projectId: string; pathname: string;
}) {
  const href = `/projects/${projectId}/schemes/${scheme.id}`;
  const isActive = pathname === href;
  return (
    <div className="relative">
      <Link
        href={href}
        className={cn(
          'flex items-center gap-1.5 h-[26px] px-2 my-px mx-1 rounded-[3px] no-underline transition-colors duration-100',
          isActive ? 'bg-accent' : 'bg-transparent hover:bg-[var(--bg)]',
        )}
      >
        <span className="absolute left-[-7px] top-1/2 w-[7px] h-px bg-[var(--border-light)] block pointer-events-none" />
        {toggleSpace}
        <span className={cn(
          'text-xs flex-1 overflow-hidden text-ellipsis whitespace-nowrap',
          isActive ? 'text-[var(--accent)] font-medium' : 'text-foreground font-light',
        )}>
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
        className={cn(
          'flex items-center gap-1.5 h-[26px] cursor-pointer px-2 my-px mx-1 rounded-[3px] relative transition-colors duration-100',
          isChildActive && !isExp ? 'bg-accent' : 'bg-transparent hover:bg-[var(--bg)]',
        )}
        onClick={() => onToggle(locationKey)}
      >
        <span className="absolute left-[-7px] top-1/2 w-[7px] h-px bg-[var(--border-light)] block pointer-events-none" />
        <ToggleBtn expanded={isExp} onToggle={(e) => { e.stopPropagation(); onToggle(locationKey); }} />
        <span className="text-xs text-foreground font-light flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {location.name ?? 'Без расположения'}
        </span>
        <span className="text-[11px] text-[var(--text-3)] shrink-0">
          ({location.schemes.length})
        </span>
      </div>
      {isExp && (
        <div className="ml-[15px] border-l border-[var(--border-light)]">
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

  const isFlatMode = project.locations.length === 1 && project.locations[0].name === null;

  return (
    <div
      onMouseEnter={() => setHoveredId(project.id)}
      onMouseLeave={() => setHoveredId(null)}
    >
      {renamingId === project.id ? (
        <div className="my-px mx-1">
          <input
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); onConfirmRename(project.id); }
              if (e.key === 'Escape') onCancelRename();
            }}
            onBlur={onCancelRename}
            className="w-full h-[26px] px-2 text-xs border border-[var(--accent)] rounded-[3px] bg-[var(--bg)] text-foreground font-[inherit] outline-none box-border"
          />
        </div>
      ) : (
        <div
          className={cn(
            'flex items-center gap-1.5 h-[26px] px-2 my-px mx-1 rounded-[3px] relative transition-colors duration-100',
            hasChildren ? 'cursor-pointer' : 'cursor-default',
            isActive && !isExp
              ? 'bg-accent'
              : showActions
              ? 'bg-[var(--bg)]'
              : 'bg-transparent hover:bg-[var(--bg)]',
            showActions ? 'pr-[28px]' : 'pr-2',
          )}
          onClick={() => { if (hasChildren) onToggle(project.id); }}
        >
          {hasChildren
            ? <ToggleBtn expanded={isExp} onToggle={(e) => { e.stopPropagation(); onToggle(project.id); }} />
            : toggleSpace
          }
          <span className={cn(
            'text-xs flex-1 overflow-hidden text-ellipsis whitespace-nowrap',
            isActive ? 'text-[var(--accent)] font-medium' : 'text-foreground font-light',
          )}>
            {project.name}
          </span>
          {schemeCount > 0 && (
            <span className="text-[11px] text-[var(--text-3)] shrink-0">
              ({schemeCount})
            </span>
          )}

          {showActions && (
            <button
              onClick={(e) => {
                e.preventDefault(); e.stopPropagation();
                setMenuOpenId(menuOpenId === project.id ? null : project.id);
              }}
              className={cn(
                'absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center border-none rounded-[3px] cursor-pointer text-muted-foreground p-0 transition-colors duration-100',
                menuOpenId === project.id ? 'bg-border' : 'bg-transparent hover:bg-[var(--border-light)]',
              )}
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
              className="absolute right-0 top-full z-[200] bg-[var(--surface)] border border-border rounded-[5px] shadow-[0_4px_12px_rgba(0,0,0,.1)] min-w-[150px] overflow-hidden py-0.5"
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
                  className={cn(
                    'w-full text-left px-3 py-[6px] text-xs bg-transparent border-none cursor-pointer font-[inherit] block transition-colors hover:bg-[var(--bg)]',
                    item.danger ? 'text-destructive' : 'text-foreground',
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isExp && hasChildren && (
        <div className="ml-[15px] border-l border-[var(--border-light)]">
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
          className="fixed inset-0 bg-black/45 flex items-center justify-center z-[1000]"
          onClick={(e) => { if (e.target === e.currentTarget) setDeleteTargetId(null); }}
          onKeyDown={(e) => { if (e.key === 'Escape') setDeleteTargetId(null); }}
        >
          <div className="bg-[var(--surface)] border border-border rounded-lg p-6 w-[320px] flex flex-col gap-4">
            <div className="text-sm font-medium text-foreground">Удалить объект?</div>
            <div className="text-[13px] text-muted-foreground">
              Все схемы объекта будут удалены. Это действие нельзя отменить.
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
                className="px-[14px] py-[6px] text-[12.5px] border-none rounded-[5px] bg-destructive text-white cursor-pointer font-[inherit] font-medium"
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
          width: collapsed ? 32 : 240,
          minWidth: collapsed ? 32 : 240,
          transition: 'width .22s cubic-bezier(.4,0,.2,1), min-width .22s cubic-bezier(.4,0,.2,1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center border-b border-border shrink-0 overflow-hidden">
          {!collapsed && (
            <div className="flex flex-1 px-2">
              {(['nav', 'fav'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={cn(
                    'text-xs font-medium px-2 py-[10px] cursor-pointer bg-transparent border-none border-b-2 whitespace-nowrap transition-colors duration-150',
                    tab === t
                      ? 'text-[var(--accent)] border-b-[var(--accent)]'
                      : 'text-muted-foreground border-b-transparent',
                  )}
                >
                  {t === 'nav' ? 'Навигация' : 'Избранное'}
                </button>
              ))}
            </div>
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
                style={{ transform: collapsed ? 'none' : 'rotate(180deg)', transition: 'transform .22s' }}
              >
                <path d="M2 1l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>

        {!collapsed && (
          <>
            {tab === 'nav' && (
              <>
                <div className="flex-1 overflow-y-auto py-2">
                  <div className="text-[10px] font-semibold tracking-[.08em] text-[var(--text-3)] uppercase px-3 pt-3 pb-1">
                    Объекты
                  </div>

                  {projectTree.length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs text-[var(--text-3)]">
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
              <div className="flex-1 overflow-y-auto py-2">
                <div className="text-[10px] font-semibold tracking-[.08em] text-[var(--text-3)] uppercase px-3 pt-3 pb-1">
                  Избранное
                </div>
                {projectTree.filter((p) => favorites.has(p.id)).length === 0 ? (
                  <div className="px-3 py-6 text-center text-xs text-[var(--text-3)]">
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
