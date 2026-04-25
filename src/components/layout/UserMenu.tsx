'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { LogOut, Settings } from 'lucide-react'
import { useMockAuth } from '@/lib/mock-auth/MockAuthContext'
import { cn } from '@/lib/utils'
import { AccountSettingsDialog } from './AccountSettingsDialog'

type Props = {
  email: string
  fullName: string | null
  initials: string
}

function MenuItem({
  onSelect,
  disabled,
  children,
}: {
  onSelect?: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <DropdownMenuPrimitive.Item
      disabled={disabled}
      onSelect={onSelect}
      className={cn(
        'flex items-center gap-2 px-3 py-[6px] text-[13px] cursor-pointer outline-none select-none transition-colors data-[highlighted]:bg-accent',
        disabled ? 'text-muted-foreground opacity-50 cursor-default' : 'text-foreground',
      )}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  )
}

export function UserMenu({ email, fullName, initials }: Props) {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { signOut } = useMockAuth()
  const router = useRouter()

  const handleSignOut = () => {
    signOut()
    router.push('/login')
  }

  return (
    <>
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <div className="w-7 h-7 rounded-full bg-accent text-[var(--accent)] text-[11px] font-semibold flex items-center justify-center border border-border cursor-pointer shrink-0 outline-none">
          {initials}
        </div>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={6}
          className="min-w-[200px] bg-[var(--surface)] border border-border rounded-[6px] py-1 shadow-[0_4px_16px_rgba(0,0,0,.15)] z-[200]"
        >
          <div className="px-3 pt-[6px] pb-2 text-[13px] text-foreground font-semibold select-none">
            {fullName ?? email}
          </div>

          <DropdownMenuPrimitive.Separator className="h-px bg-border my-0.5" />

          <MenuItem onSelect={() => setSettingsOpen(true)}>
            <Settings size={14} />
            Настройки учётной записи
          </MenuItem>

          <DropdownMenuPrimitive.Separator className="h-px bg-border my-0.5" />

          <MenuItem onSelect={handleSignOut}>
            <LogOut size={14} />
            Выйти
          </MenuItem>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
    <AccountSettingsDialog
      email={email}
      fullName={fullName}
      open={settingsOpen}
      onOpenChange={setSettingsOpen}
    />
    </>
  )
}
