import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, SchemeInsert, SchemeUpdate } from '@/types/database'

type Client = SupabaseClient<Database>

export const getSchemesByProject = (supabase: Client, projectId: string) =>
  supabase
    .from('schemes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

export const getAllSchemesSummary = (supabase: Client) =>
  supabase
    .from('schemes')
    .select('id, project_id, device_name, installation_location')
    .order('created_at', { ascending: true })

export const getScheme = (supabase: Client, schemeId: string) =>
  supabase.from('schemes').select('*').eq('id', schemeId).single()

export const createScheme = (supabase: Client, data: SchemeInsert) =>
  supabase.from('schemes').insert(data).select().single()

export const updateScheme = (supabase: Client, id: string, data: SchemeUpdate) =>
  supabase.from('schemes').update(data).eq('id', id).select().single()

export const deleteScheme = (supabase: Client, id: string) =>
  supabase.from('schemes').delete().eq('id', id)
