'use client'

import AuthGuard from '@/components/auth/AuthGuard'
import Topbar from '@/components/layout/Topbar'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="h-full flex flex-col overflow-hidden">
        <Topbar />
        {children}
      </div>
    </AuthGuard>
  )
}
