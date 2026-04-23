'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const loginSchema = z.object({
  email: z.string().min(1, 'Укажите email').email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

type LoginValues = z.infer<typeof loginSchema>

const s = {
  wrap: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  logo: {
    fontSize: 18,
    fontWeight: 600,
    letterSpacing: '.06em',
    color: 'var(--text-1)',
    marginBottom: 6,
  },
  tagline: {
    fontSize: 12,
    color: 'var(--text-3)',
    marginBottom: 36,
    textAlign: 'center' as const,
    lineHeight: 1.5,
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    padding: '28px 28px 24px',
    width: '100%',
    maxWidth: 360,
  },
  cardTitle: { fontSize: 15, fontWeight: 500, marginBottom: 4 },
  cardSub: { fontSize: 12, color: 'var(--text-2)', marginBottom: 24 },
  field: { display: 'flex', flexDirection: 'column' as const, gap: 5, marginBottom: 14 },
  label: { fontSize: 12, color: 'var(--text-2)' },
  fieldError: { fontSize: 11, color: 'var(--err)', marginTop: -2 },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    margin: '18px 0',
    color: 'var(--text-3)',
    fontSize: 11,
  },
  dividerLine: { flex: 1, height: 1, background: 'var(--border)' },
  footer: { marginTop: 20, fontSize: 11, color: 'var(--text-3)', textAlign: 'center' as const },
} as const

export default function LoginForm() {
  const router = useRouter()
  const [showPw, setShowPw] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginValues) => {
    setServerError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })
    if (error) {
      setServerError('Неверный email или пароль')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  const inputStyle = (hasError: boolean) => ({
    border: `1px solid ${hasError ? 'var(--err)' : 'var(--border)'}`,
    borderRadius: 5,
    padding: '8px 11px',
    fontSize: 13,
    fontFamily: 'inherit',
    fontWeight: 300,
    color: 'var(--text-1)',
    background: hasError ? 'var(--err-bg)' : 'var(--bg)',
    outline: 'none',
    width: '100%',
  })

  return (
    <div style={s.wrap}>
      <div style={s.logo}>SLDt</div>
      <div style={s.tagline}>
        Автоматизация электротехнической документации
        <br />
        по ГОСТ 21.613-2014
      </div>

      <div style={s.card}>
        <div style={s.cardTitle}>Вход в систему</div>
        <div style={s.cardSub}>Введите рабочие данные учётной записи</div>

        {serverError && (
          <div style={{ background: 'var(--err-bg)', border: '1px solid #e4b0b0', borderRadius: 5, padding: '10px 12px', fontSize: 12, color: 'var(--err)', marginBottom: 14 }}>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              type="email"
              placeholder="ivanov@company.ru"
              autoComplete="email"
              style={inputStyle(!!errors.email)}
              {...register('email')}
            />
            {errors.email && <span style={s.fieldError}>{errors.email.message}</span>}
          </div>

          <div style={s.field}>
            <label style={s.label}>Пароль</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ ...inputStyle(!!errors.password), paddingRight: 36 }}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: 0 }}
              >
                {showPw ? '○' : '●'}
              </button>
            </div>
            {errors.password && <span style={s.fieldError}>{errors.password.message}</span>}
          </div>

          <button
            type="button"
            style={{ fontSize: 11.5, color: 'var(--accent)', display: 'block', textAlign: 'right', width: '100%', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20 }}
          >
            Забыли пароль?
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{ width: '100%', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 5, padding: '9px', fontSize: 13, fontWeight: 500, fontFamily: 'inherit', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {isSubmitting ? 'Вход…' : 'Войти'}
          </button>
        </form>

        <div style={s.divider}>
          <span style={s.dividerLine} />
          или
          <span style={s.dividerLine} />
        </div>

        <button
          style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 5, padding: '8px', fontSize: 12.5, fontFamily: 'inherit', fontWeight: 400, color: 'var(--text-2)', background: 'var(--surface)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          ⊟ Войти через SSO / LDAP
        </button>
      </div>

      <div style={s.footer}>
        Нет аккаунта?{' '}
        <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Запросить доступ</span>
        &nbsp;·&nbsp;
        <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>Документация</span>
      </div>
    </div>
  )
}
