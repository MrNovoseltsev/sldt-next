'use client'

import { useState } from 'react'
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu'
import { LogOut, Settings } from 'lucide-react'
import { signOut } from '@/app/actions/auth'

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
  const [hovered, setHovered] = useState(false)
  return (
    <DropdownMenuPrimitive.Item
      disabled={disabled}
      onSelect={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 12px',
        fontSize: 13,
        color: disabled ? 'var(--text-2)' : 'var(--text-1)',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        background: hovered && !disabled ? 'var(--accent-bg)' : 'transparent',
        outline: 'none',
        userSelect: 'none',
      }}
    >
      {children}
    </DropdownMenuPrimitive.Item>
  )
}

export function UserMenu({ email, fullName, initials }: Props) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        <div
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
            outline: 'none',
          }}
        >
          {initials}
        </div>
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align="end"
          sideOffset={6}
          style={{
            minWidth: 200,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '4px 0',
            boxShadow: '0 4px 16px rgba(0,0,0,.15)',
            zIndex: 200,
          }}
        >
          <div
            style={{
              padding: '6px 12px 8px',
              fontSize: 13,
              color: 'var(--text-1)',
              fontWeight: 600,
              userSelect: 'none',
            }}
          >
            {fullName ?? email}
          </div>

          <DropdownMenuPrimitive.Separator
            style={{ height: 1, background: 'var(--border)', margin: '2px 0' }}
          />

          <MenuItem disabled>
            <Settings size={14} />
            Настройки учётной записи
          </MenuItem>

          <DropdownMenuPrimitive.Separator
            style={{ height: 1, background: 'var(--border)', margin: '2px 0' }}
          />

          <MenuItem onSelect={() => signOut()}>
            <LogOut size={14} />
            Выйти
          </MenuItem>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  )
}
