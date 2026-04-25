'use client'

import { MockAuthProvider } from '@/lib/mock-auth/MockAuthContext'
import { MockDataProvider } from '@/lib/mock-db/MockDataContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <MockAuthProvider>
      <MockDataProvider>{children}</MockDataProvider>
    </MockAuthProvider>
  )
}
