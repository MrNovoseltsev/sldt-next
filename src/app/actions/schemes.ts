'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createScheme, updateScheme, deleteScheme } from '@/lib/supabase/queries'
import type { SchemeInsert, SchemeUpdate } from '@/types/database'

export async function createSchemeAction(
  projectId: string,
  deviceName?: string,
): Promise<{ data: { id: string } | null; error: string | null }> {
  const supabase = await createClient()
  const insert: SchemeInsert = { project_id: projectId, device_name: deviceName || null }
  const { data, error } = await createScheme(supabase, insert)
  if (error) return { data: null, error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { data: { id: data.id }, error: null }
}

export async function updateSchemeAction(
  id: string,
  projectId: string,
  data: SchemeUpdate,
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await updateScheme(supabase, id, data)
  if (error) return { error: error.message }

  revalidatePath(`/projects/${projectId}`)
  return { error: null }
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
