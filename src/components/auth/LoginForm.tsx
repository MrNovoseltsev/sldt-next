'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().min(1, 'Укажите email').email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
})

type LoginValues = z.infer<typeof loginSchema>

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

  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-[18px] font-semibold tracking-[.06em] text-foreground mb-[6px]">SLDt</div>
      <div className="text-xs text-[var(--text-3)] mb-9 text-center leading-[1.5]">
        Автоматизация электротехнической документации
        <br />
        по ГОСТ 21.613-2014
      </div>

      <div className="bg-[var(--surface)] border border-border rounded-lg p-[28px_28px_24px] w-full max-w-[360px]">
        <div className="text-[15px] font-medium mb-1">Вход в систему</div>
        <div className="text-xs text-muted-foreground mb-6">Введите рабочие данные учётной записи</div>

        {serverError && (
          <div className="bg-[var(--err-bg)] border border-[#e4b0b0] rounded-[5px] px-3 py-[10px] text-xs text-destructive mb-[14px]">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex flex-col gap-[5px] mb-[14px]">
            <label className="text-xs text-muted-foreground">Email</label>
            <input
              type="email"
              placeholder="ivanov@company.ru"
              autoComplete="email"
              className={cn(
                'border rounded-[5px] px-[11px] py-[8px] text-[13px] font-light text-foreground outline-none w-full transition-colors focus:border-[var(--accent)]',
                errors.email ? 'border-destructive bg-[var(--err-bg)] focus:border-destructive' : 'border-border bg-[var(--bg)]',
              )}
              {...register('email')}
            />
            {errors.email && <span className="text-[11px] text-destructive -mt-[2px]">{errors.email.message}</span>}
          </div>

          <div className="flex flex-col gap-[5px] mb-[14px]">
            <label className="text-xs text-muted-foreground">Пароль</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className={cn(
                  'border rounded-[5px] px-[11px] py-[8px] pr-9 text-[13px] font-light text-foreground outline-none w-full transition-colors focus:border-[var(--accent)]',
                  errors.password ? 'border-destructive bg-[var(--err-bg)] focus:border-destructive' : 'border-border bg-[var(--bg)]',
                )}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[var(--text-3)] bg-transparent border-none cursor-pointer text-[13px] p-0"
              >
                {showPw ? '○' : '●'}
              </button>
            </div>
            {errors.password && <span className="text-[11px] text-destructive -mt-[2px]">{errors.password.message}</span>}
          </div>

          <button
            type="button"
            className="text-[11.5px] text-[var(--accent)] block text-right w-full bg-transparent border-none cursor-pointer mb-5"
          >
            Забыли пароль?
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full bg-[var(--accent)] text-white border-none rounded-[5px] py-[9px] text-[13px] font-medium font-[inherit] flex items-center justify-center gap-2 transition-opacity',
              isSubmitting ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
            )}
          >
            {isSubmitting ? 'Вход…' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
