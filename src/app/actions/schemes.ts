'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createScheme, deleteScheme } from '@/lib/supabase/queries'

export async function createSchemeAction(projectId: string): Promise<{ data: { id: string } | null; error: string | null }> {
  const supabase = await createClient()
  const { data, error } = await createScheme(supabase, { project_id: projectId })
  if (error) return { data: null, error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { data: { id: data.id }, error: null }
}

export async function deleteSchemeAction(
  id: string,
  projectId: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await deleteScheme(supabase, id)
  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
}
