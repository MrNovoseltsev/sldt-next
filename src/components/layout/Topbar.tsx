import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from '@/components/layout/UserMenu'

export default async function Topbar() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const email = user?.email ?? ''
  const fullName =
    (user?.user_metadata?.full_name as string | undefined) ??
    (user?.user_metadata?.name as string | undefined) ??
    null
  const initials = email.slice(0, 2).toUpperCase() || '??'

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
      <Link
        href="/dashboard"
        style={{
          fontWeight: 600,
          fontSize: 13,
          letterSpacing: '.04em',
          color: 'var(--text-1)',
          paddingRight: 10,
          borderRight: '1px solid var(--border)',
          marginRight: 12,
          whiteSpace: 'nowrap',
          textDecoration: 'none',
        }}
      >
        SLDt
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flex: 1, overflow: 'hidden' }}>
        <span style={{ color: 'var(--text-2)', fontSize: 13 }}>Объекты</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <UserMenu email={email} fullName={fullName} initials={initials} />
      </div>
    </header>
  )
}
