export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex items-center justify-center py-6 px-4" style={{ background: 'var(--bg)' }}>
      {children}
    </div>
  )
}
