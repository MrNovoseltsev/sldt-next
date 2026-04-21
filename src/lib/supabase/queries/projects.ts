import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database, ProjectInsert, ProjectUpdate } from '@/types/database'

type Client = SupabaseClient<Database>

export const getProjects = (supabase: Client) =>
  supabase.from('projects').select('*').order('updated_at', { ascending: false })

export const getProject = (supabase: Client, id: string) =>
  supabase.from('projects').select('*').eq('id', id).single()

export const createProject = (supabase: Client, data: ProjectInsert) =>
  supabase.from('projects').insert(data).select().single()

export const updateProject = (supabase: Client, id: string, data: ProjectUpdate) =>
  supabase.from('projects').update(data).eq('id', id).select().single()

export const deleteProject = (supabase: Client, id: string) =>
  supabase.from('projects').delete().eq('id', id)
