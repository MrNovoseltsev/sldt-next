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
    <header className="h-12 min-h-[48px] bg-[var(--surface)] border-b border-border flex items-center px-3 relative z-[100] shrink-0">
      <Link
        href="/dashboard"
        className="font-semibold text-[13px] tracking-[.04em] text-foreground pr-[10px] border-r border-border mr-3 whitespace-nowrap no-underline"
      >
        SLDt
      </Link>

      <div className="flex items-center gap-1 flex-1 overflow-hidden">
        <span className="text-muted-foreground text-[13px]">Объекты</span>
      </div>

      <div className="flex items-center gap-1.5">
        <UserMenu email={email} fullName={fullName} initials={initials} />
      </div>
    </header>
  )
}
