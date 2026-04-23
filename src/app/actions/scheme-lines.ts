'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateScheme, getSchemeLines, createSchemeLine, updateSchemeLine, deleteSchemeLine } from '@/lib/supabase/queries'
import type { SchemeUpdate, SchemeLineRow } from '@/types/database'

export async function saveSchemeHeaderAction(
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

export async function saveAllLinesAction(
  schemeId: string,
  projectId: string,
  lines: Omit<SchemeLineRow, 'created_at' | 'updated_at'>[],
): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { data: existing, error: fetchErr } = await getSchemeLines(supabase, schemeId)
  if (fetchErr) return { error: fetchErr.message }

  const existingIds = new Set((existing ?? []).map((l) => l.id))
  const incomingIds = new Set(lines.map((l) => l.id))

  // Delete lines removed by the user
  const toDelete = [...existingIds].filter((id) => !incomingIds.has(id))
  for (const id of toDelete) {
    const { error } = await deleteSchemeLine(supabase, id)
    if (error) return { error: error.message }
  }

  // Upsert each line
  for (const line of lines) {
    if (existingIds.has(line.id)) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, scheme_id, ...rest } = line
      const { error } = await updateSchemeLine(supabase, id, rest)
      if (error) return { error: error.message }
    } else {
      const { error } = await createSchemeLine(supabase, line)
      if (error) return { error: error.message }
    }
  }

  revalidatePath(`/projects/${projectId}/schemes/${schemeId}`)
  return { error: null }
}
