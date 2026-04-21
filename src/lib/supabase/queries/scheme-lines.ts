import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, SchemeLineInsert, SchemeLineUpdate } from '@/types/database'

type Client = SupabaseClient<Database>

export const getSchemeLines = (supabase: Client, schemeId: string) =>
  supabase
    .from('scheme_lines')
    .select('*')
    .eq('scheme_id', schemeId)
    .order('line_order', { ascending: true })

export const createSchemeLine = (supabase: Client, data: SchemeLineInsert) =>
  supabase.from('scheme_lines').insert(data).select().single()

export const updateSchemeLine = (supabase: Client, id: string, data: SchemeLineUpdate) =>
  supabase.from('scheme_lines').update(data).eq('id', id).select().single()

export const deleteSchemeLine = (supabase: Client, id: string) =>
  supabase.from('scheme_lines').delete().eq('id', id)

export const reorderSchemeLines = async (
  supabase: Client,
  lines: { id: string; line_order: number }[],
) => {
  const results = await Promise.all(
    lines.map(({ id, line_order }) =>
      supabase.from('scheme_lines').update({ line_order }).eq('id', id).select().single(),
    ),
  )
  const failed = results.find((r) => r.error)
  if (failed) return { data: null, error: failed.error }
  return { data: results.map((r) => r.data!), error: null }
}
