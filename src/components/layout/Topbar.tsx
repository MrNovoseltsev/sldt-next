import { createClient } from '@/lib/supabase/server'

export default async function Topbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const initials = user?.email?.slice(0, 2).toUpperCase() ?? '??'

  return (
    <header
      style={{
        height: 48,
        minHeight: 48,
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        position: 'relative',
        zIndex: 100,
        flexShrink: 0,
        gap: 0,
      }}
    >
      <span
        style={{
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: '.04em',
          color: 'var(--text-1)',
          paddingRight: 10,
          borderRight: '1px solid var(--border)',
          marginRight: 12,
          whiteSpace: 'nowrap',
        }}
      >
        SLDt
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, overflow: 'hidden' }}>
        <span style={{ color: 'var(--text-2)', fontSize: 13 }}>Проекты</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          title={user?.email ?? ''}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            background: 'var(--accent-bg)',
            color: 'var(--accent)',
            fontSize: 11,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
      </div>
    </header>
  )
}
