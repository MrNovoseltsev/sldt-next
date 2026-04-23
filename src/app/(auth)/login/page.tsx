import type { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'SLDt — Вход' }

export default function LoginPage() {
  return <LoginForm />
}
