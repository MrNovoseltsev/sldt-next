'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createProject, updateProject, deleteProject } from '@/lib/supabase/queries'
import type { CreateProjectInput, UpdateProjectInput } from '@/lib/validations/project'

export async function createProjectAction(data: CreateProjectInput): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Не авторизован' }

  const { error } = await createProject(supabase, { ...data, user_id: user.id })
  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { error: null }
}

export async function updateProjectAction(
  id: string,
  data: UpdateProjectInput,
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await updateProject(supabase, id, data)
  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { error: null }
}

export async function deleteProjectAction(id: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await deleteProject(supabase, id)
  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { error: null }
}
