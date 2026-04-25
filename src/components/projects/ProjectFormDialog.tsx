'use client'

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
import type { ProjectRow } from '@/types/database'
import { useMockData } from '@/lib/mock-db/MockDataContext'
import { MOCK_USER_ID } from '@/lib/mock-db/types'
import { cn } from '@/lib/utils'

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
  const { createProject, updateProject } = useMockData()

  const schema = mode === 'create' ? createProjectSchema : updateProjectSchema
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectInput | UpdateProjectInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: project?.name ?? '',
      customer: project?.customer ?? '',
    },
  })

  const onSubmit = (data: CreateProjectInput | UpdateProjectInput) => {
    const result =
      mode === 'create'
        ? createProject({
            name: (data as CreateProjectInput).name,
            customer: (data as CreateProjectInput).customer ?? null,
            user_id: MOCK_USER_ID,
          })
        : updateProject(project!.id, {
            name: data.name,
            customer: (data as UpdateProjectInput).customer ?? null,
          })

    if (result.error) {
      setError('root', { message: result.error })
      return
    }
    reset()
    onSuccess()
  }

  const handleOpenChange = (val: boolean) => {
    if (!isSubmitting) {
      reset()
      onOpenChange(val)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            {mode === 'create' ? 'Новый объект' : 'Редактировать объект'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-[14px] py-1 pb-4">
            <div className="flex flex-col gap-[5px]">
              <label className="text-[11px] text-muted-foreground">
                Название объекта <span className="text-destructive">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="Например: Офис на Тверской"
                autoFocus
                className={cn(
                  'border rounded-[5px] px-[10px] py-[7px] text-[13px] text-foreground bg-[var(--bg)] outline-none font-[inherit] transition-colors',
                  errors.name
                    ? 'border-destructive focus:border-destructive'
                    : 'border-border focus:border-[var(--accent)]',
                )}
              />
              {errors.name && (
                <span className="text-[11px] text-destructive">{errors.name.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-[5px]">
              <label className="text-[11px] text-muted-foreground">Заказчик</label>
              <input
                {...register('customer')}
                placeholder="Наименование организации"
                className="border border-border rounded-[5px] px-[10px] py-[7px] text-[13px] text-foreground bg-[var(--bg)] outline-none font-[inherit] transition-colors focus:border-[var(--accent)]"
              />
            </div>

            {errors.root && (
              <div className="text-xs text-destructive bg-[var(--err-bg)] px-[10px] py-[7px] rounded-[5px]">
                {errors.root.message}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className="border border-border rounded-[5px] px-[14px] py-[6px] text-xs text-muted-foreground bg-transparent cursor-pointer font-[inherit] transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                'border-none rounded-[5px] px-[16px] py-[6px] text-xs text-white font-medium font-[inherit] transition-colors',
                isSubmitting ? 'bg-[var(--text-3)] cursor-not-allowed' : 'bg-[var(--accent)] cursor-pointer',
              )}
            >
              Сохранить
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
