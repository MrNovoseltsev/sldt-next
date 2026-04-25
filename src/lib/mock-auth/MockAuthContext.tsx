'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { MOCK_USER_ID } from '@/lib/mock-db/types'

export const MOCK_LOGIN_EMAIL = 'admin@sldt.local'
export const MOCK_DEFAULT_PASSWORD = '123456'

export interface MockUser {
  id: string
  email: string
  fullName: string | null
}

interface PasswordChangeArgs {
  currentPassword: string
  newPassword: string
}

interface MockAuthApi {
  isAuthenticated: boolean
  user: MockUser | null
  signIn(email: string, password: string): { error: string | null }
  signOut(): void
  updateProfile(name: string): { error: string | null }
  changePassword(args: PasswordChangeArgs): { error: string | null }
}

const MockAuthContext = createContext<MockAuthApi | null>(null)

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)
  const [password, setPassword] = useState<string>(MOCK_DEFAULT_PASSWORD)

  const signIn = useCallback(
    (email: string, candidatePassword: string) => {
      if (email !== MOCK_LOGIN_EMAIL || candidatePassword !== password) {
        return { error: 'Неверный email или пароль' }
      }
      setUser({ id: MOCK_USER_ID, email: MOCK_LOGIN_EMAIL, fullName: null })
      return { error: null }
    },
    [password],
  )

  const signOut = useCallback(() => {
    setUser(null)
  }, [])

  const updateProfile = useCallback((name: string) => {
    setUser((prev) => (prev ? { ...prev, fullName: name.trim() || null } : prev))
    return { error: null }
  }, [])

  const changePassword = useCallback(
    ({ currentPassword, newPassword }: PasswordChangeArgs) => {
      if (currentPassword !== password) {
        return { error: 'Неверный текущий пароль' }
      }
      setPassword(newPassword)
      return { error: null }
    },
    [password],
  )

  const value = useMemo<MockAuthApi>(
    () => ({
      isAuthenticated: user !== null,
      user,
      signIn,
      signOut,
      updateProfile,
      changePassword,
    }),
    [user, signIn, signOut, updateProfile, changePassword],
  )

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>
}

export function useMockAuth(): MockAuthApi {
  const ctx = useContext(MockAuthContext)
  if (!ctx) throw new Error('useMockAuth must be used within MockAuthProvider')
  return ctx
}
