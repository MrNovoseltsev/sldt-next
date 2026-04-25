import type {
  ProjectRow,
  ProjectInsert,
  ProjectUpdate,
  SchemeRow,
  SchemeInsert,
  SchemeUpdate,
  SchemeLineRow,
  SchemeLineInsert,
  SchemeLineUpdate,
} from '@/types/database'

export type {
  ProjectRow,
  ProjectInsert,
  ProjectUpdate,
  SchemeRow,
  SchemeInsert,
  SchemeUpdate,
  SchemeLineRow,
  SchemeLineInsert,
  SchemeLineUpdate,
}

export interface MockDb {
  projects: ProjectRow[]
  schemes: SchemeRow[]
  schemeLines: SchemeLineRow[]
}

export type SchemeSummary = Pick<
  SchemeRow,
  'id' | 'project_id' | 'device_name' | 'installation_location'
>

export const MOCK_USER_ID = '00000000-0000-0000-0000-000000000001'
