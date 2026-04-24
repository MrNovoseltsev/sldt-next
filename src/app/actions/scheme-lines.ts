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

  // Sanitize numeric fields that have DB check constraints
  const sanitized = lines.map((line) => ({
    ...line,
    cos_phi:
      line.cos_phi !== null && (line.cos_phi < 0.01 || line.cos_phi > 1.0)
        ? null
        : line.cos_phi,
  }))

  // Upsert each line
  for (const line of sanitized) {
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
