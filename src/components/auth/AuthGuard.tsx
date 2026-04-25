'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMockAuth } from '@/lib/mock-auth/MockAuthContext'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useMockAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login')
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null
  return <>{children}</>
}
