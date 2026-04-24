import { z } from 'zod'

export const projectSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Название объекта обязательно').max(255),
  customer: z.string().max(255).optional(),
})

export const createProjectSchema = projectSchema.omit({ id: true })
export const updateProjectSchema = projectSchema.partial().required({ name: true })

export type ProjectFormValues = z.infer<typeof projectSchema>
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
