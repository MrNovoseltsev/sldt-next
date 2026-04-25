'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  updateProfileSchema,
  changePasswordSchema,
  type UpdateProfileInput,
  type ChangePasswordInput,
} from '@/lib/validations/user'
import { useMockAuth } from '@/lib/mock-auth/MockAuthContext'
import { cn } from '@/lib/utils'

interface Props {
  email: string
  fullName: string | null
  open: boolean
  onOpenChange: (v: boolean) => void
}

const inputClass =
  'border rounded-[5px] px-[10px] py-[7px] text-[13px] text-foreground bg-[var(--bg)] outline-none font-[inherit] transition-colors w-full'
const inputNormal = 'border-border focus:border-[var(--accent)]'
const inputError = 'border-destructive focus:border-destructive'
const labelClass = 'text-[11px] text-muted-foreground'
const errorClass = 'text-[11px] text-destructive'

export function AccountSettingsDialog({ email, fullName, open, onOpenChange }: Props) {
  const { updateProfile, changePassword } = useMockAuth()
  const [showPassword, setShowPassword] = useState(false)

  const profileForm = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: fullName ?? '' },
  })

  const passwordForm = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const profilePending = profileForm.formState.isSubmitting
  const passwordPending = passwordForm.formState.isSubmitting

  const handleOpenChange = (val: boolean) => {
    if (profilePending || passwordPending) return
    if (!val) {
      passwordForm.reset()
      setShowPassword(false)
    }
    onOpenChange(val)
  }

  const onProfileSubmit = (data: UpdateProfileInput) => {
    const result = updateProfile(data.name)
    if (result.error) {
      profileForm.setError('root', { message: result.error })
    }
  }

  const onPasswordSubmit = (data: ChangePasswordInput) => {
    const result = changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    })
    if (result.error) {
      passwordForm.setError('root', { message: result.error })
      return
    }
    passwordForm.reset()
    setShowPassword(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">Настройки учётной записи</DialogTitle>
        </DialogHeader>

        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
          <div className="flex flex-col gap-[14px] pb-4">
            <div className="flex flex-col gap-[5px]">
              <label className={labelClass}>Имя</label>
              <input
                {...profileForm.register('name')}
                placeholder="Ваше имя"
                className={cn(
                  inputClass,
                  profileForm.formState.errors.name ? inputError : inputNormal,
                )}
              />
              {profileForm.formState.errors.name && (
                <span className={errorClass}>{profileForm.formState.errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-[5px]">
              <label className={labelClass}>Почта</label>
              <input
                value={email}
                readOnly
                className={cn(inputClass, inputNormal, 'opacity-50 cursor-default')}
              />
            </div>

            {profileForm.formState.errors.root && (
              <div className="text-xs text-destructive bg-[var(--err-bg)] px-[10px] py-[7px] rounded-[5px]">
                {profileForm.formState.errors.root.message}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={profilePending}
                className={cn(
                  'border-none rounded-[5px] px-[16px] py-[6px] text-xs text-white font-medium font-[inherit] transition-colors',
                  profilePending
                    ? 'bg-[var(--text-3)] cursor-not-allowed'
                    : 'bg-[var(--accent)] cursor-pointer',
                )}
              >
                {profilePending ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </div>
        </form>

        <div className="h-px bg-border" />

        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              setShowPassword((v) => !v)
              passwordForm.reset()
            }}
            className="text-[13px] text-[var(--accent)] cursor-pointer bg-transparent border-none font-[inherit] p-0"
          >
            {showPassword ? 'Отменить смену пароля' : 'Изменить пароль'}
          </button>

          {showPassword && (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <div className="flex flex-col gap-[14px] mt-[14px]">
                <div className="flex flex-col gap-[5px]">
                  <label className={labelClass}>Текущий пароль</label>
                  <input
                    {...passwordForm.register('currentPassword')}
                    type="password"
                    autoComplete="current-password"
                    className={cn(
                      inputClass,
                      passwordForm.formState.errors.currentPassword ? inputError : inputNormal,
                    )}
                  />
                  {passwordForm.formState.errors.currentPassword && (
                    <span className={errorClass}>
                      {passwordForm.formState.errors.currentPassword.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-[5px]">
                  <label className={labelClass}>Новый пароль</label>
                  <input
                    {...passwordForm.register('newPassword')}
                    type="password"
                    autoComplete="new-password"
                    className={cn(
                      inputClass,
                      passwordForm.formState.errors.newPassword ? inputError : inputNormal,
                    )}
                  />
                  {passwordForm.formState.errors.newPassword && (
                    <span className={errorClass}>
                      {passwordForm.formState.errors.newPassword.message}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-[5px]">
                  <label className={labelClass}>Повторите новый пароль</label>
                  <input
                    {...passwordForm.register('confirmPassword')}
                    type="password"
                    autoComplete="new-password"
                    className={cn(
                      inputClass,
                      passwordForm.formState.errors.confirmPassword ? inputError : inputNormal,
                    )}
                  />
                  {passwordForm.formState.errors.confirmPassword && (
                    <span className={errorClass}>
                      {passwordForm.formState.errors.confirmPassword.message}
                    </span>
                  )}
                </div>

                {passwordForm.formState.errors.root && (
                  <div className="text-xs text-destructive bg-[var(--err-bg)] px-[10px] py-[7px] rounded-[5px]">
                    {passwordForm.formState.errors.root.message}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordPending}
                    className={cn(
                      'border-none rounded-[5px] px-[16px] py-[6px] text-xs text-white font-medium font-[inherit] transition-colors',
                      passwordPending
                        ? 'bg-[var(--text-3)] cursor-not-allowed'
                        : 'bg-[var(--accent)] cursor-pointer',
                    )}
                  >
                    {passwordPending ? 'Сохранение…' : 'Сменить пароль'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
