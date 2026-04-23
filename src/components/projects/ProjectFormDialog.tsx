'use client'

import { useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { createProjectSchema, updateProjectSchema } from '@/lib/validations/project'
import type { CreateProjectInput, UpdateProjectInput } from '@/lib/validations/project'
import { createProjectAction, updateProjectAction } from '@/app/actions/projects'
import type { ProjectRow } from '@/types/database'

interface ProjectFormDialogProps {
  mode: 'create' | 'edit'
  project?: ProjectRow
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export default function ProjectFormDialog({
  mode,
  project,
  open,
  onOpenChange,
  onSuccess,
}: ProjectFormDialogProps) {
  const [isPending, startTransition] = useTransition()

  const schema = mode === 'create' ? createProjectSchema : updateProjectSchema
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<CreateProjectInput | UpdateProjectInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: project?.name ?? '',
      customer: project?.customer ?? '',
    },
  })

  const onSubmit = (data: CreateProjectInput | UpdateProjectInput) => {
    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createProjectAction(data as CreateProjectInput)
          : await updateProjectAction(project!.id, data as UpdateProjectInput)

      if (result.error) {
        setError('root', { message: result.error })
        return
      }
      reset()
      onSuccess()
    })
  }

  const handleOpenChange = (val: boolean) => {
    if (!isPending) {
      reset()
      onOpenChange(val)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent style={{ maxWidth: 420 }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: 14, fontWeight: 600 }}>
            {mode === 'create' ? 'Новый проект' : 'Редактировать проект'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: '4px 0 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, color: 'var(--text-2)' }}>
                Название проекта <span style={{ color: 'var(--err)' }}>*</span>
              </label>
              <input
                {...register('name')}
                placeholder="Например: Офис на Тверской"
                autoFocus
                style={{
                  border: `1px solid ${errors.name ? 'var(--err)' : 'var(--border)'}`,
                  borderRadius: 5,
                  padding: '7px 10px',
                  fontSize: 13,
                  color: 'var(--text-1)',
                  background: 'var(--bg)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color .15s',
                }}
                onFocus={(e) => {
                  if (!errors.name) e.currentTarget.style.borderColor = 'var(--accent)'
                }}
                onBlur={(e) => {
                  if (!errors.name) e.currentTarget.style.borderColor = 'var(--border)'
                }}
              />
              {errors.name && (
                <span style={{ fontSize: 11, color: 'var(--err)' }}>{errors.name.message}</span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              <label style={{ fontSize: 11, color: 'var(--text-2)' }}>Заказчик</label>
              <input
                {...register('customer')}
                placeholder="Наименование организации"
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 5,
                  padding: '7px 10px',
                  fontSize: 13,
                  color: 'var(--text-1)',
                  background: 'var(--bg)',
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'border-color .15s',
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
              />
            </div>

            {errors.root && (
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--err)',
                  background: 'var(--err-bg)',
                  padding: '7px 10px',
                  borderRadius: 5,
                }}
              >
                {errors.root.message}
              </div>
            )}
          </div>

          <DialogFooter style={{ gap: 8 }}>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 5,
                padding: '6px 14px',
                fontSize: 12,
                color: 'var(--text-2)',
                background: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'border-color .15s, color .15s',
              }}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                background: isPending ? 'var(--text-3)' : 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 5,
                padding: '6px 16px',
                fontSize: 12,
                fontWeight: 500,
                cursor: isPending ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                transition: 'background .15s',
              }}
            >
              {isPending ? 'Сохранение…' : 'Сохранить'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
