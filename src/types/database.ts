export type ProjectRow = {
  id: string
  name: string
  customer: string | null
  user_id: string
  created_at: string
  updated_at: string
}

export type ProjectInsert = {
  id?: string
  name: string
  customer?: string | null
  user_id: string
  created_at?: string
  updated_at?: string
}

export type ProjectUpdate = {
  name?: string
  customer?: string | null
  updated_at?: string
}

export type SchemeRow = {
  id: string
  project_id: string
  device_name: string | null
  shell_brand: string | null
  shell_code: string | null
  installation_method: string | null
  protection_degree: string | null
  installation_location: string | null
  phases_count: number | null
  network_type: string | null
  power_supply_from: string | null
  modules_count: number | null
  input_device_type: string | null
  nominal_current: number | null
  trip_setting: number | null
  switching_capacity: number | null
  protection_characteristic: string | null
  poles_count: number | null
  differential_current: number | null
  designation: string | null
  cable_info: string | null
  installed_power_kva: number | null
  installed_power_current: number | null
  calculated_power_kva: number | null
  calculated_current: number | null
  demand_coefficient: number | null
  current_phase_a: number | null
  current_phase_b: number | null
  current_phase_c: number | null
  created_at: string
  updated_at: string
}

export type SchemeInsert = {
  id?: string
  project_id: string
  device_name?: string | null
  shell_brand?: string | null
  shell_code?: string | null
  installation_method?: string | null
  protection_degree?: string | null
  installation_location?: string | null
  phases_count?: number | null
  network_type?: string | null
  power_supply_from?: string | null
  modules_count?: number | null
  input_device_type?: string | null
  nominal_current?: number | null
  trip_setting?: number | null
  switching_capacity?: number | null
  protection_characteristic?: string | null
  poles_count?: number | null
  differential_current?: number | null
  designation?: string | null
  cable_info?: string | null
  installed_power_kva?: number | null
  installed_power_current?: number | null
  calculated_power_kva?: number | null
  calculated_current?: number | null
  demand_coefficient?: number | null
  current_phase_a?: number | null
  current_phase_b?: number | null
  current_phase_c?: number | null
  created_at?: string
  updated_at?: string
}

export type SchemeUpdate = Partial<Omit<SchemeInsert, 'project_id'>>

export type SchemeLineRow = {
  id: string
  scheme_id: string
  line_order: number
  circuit_breaker_designation: string | null
  circuit_breaker_type: string | null
  cb_nominal_current: number | null
  cb_trip_setting: number | null
  cb_protection_type: string | null
  cb_differential_current: number | null
  cable_designation: string | null
  cable_brand: string | null
  cable_length: number | null
  pipe_designation: string | null
  pipe_length: number | null
  pipe_marking: string | null
  power_kw: number | null
  phase_a_current: number | null
  phase_b_current: number | null
  phase_c_current: number | null
  cos_phi: number | null
  load_name: string | null
  load_type: string | null
  load_drawing: string | null
  created_at: string
  updated_at: string
}

export type SchemeLineInsert = {
  id?: string
  scheme_id: string
  line_order: number
  circuit_breaker_designation?: string | null
  circuit_breaker_type?: string | null
  cb_nominal_current?: number | null
  cb_trip_setting?: number | null
  cb_protection_type?: string | null
  cb_differential_current?: number | null
  cable_designation?: string | null
  cable_brand?: string | null
  cable_length?: number | null
  pipe_designation?: string | null
  pipe_length?: number | null
  pipe_marking?: string | null
  power_kw?: number | null
  phase_a_current?: number | null
  phase_b_current?: number | null
  phase_c_current?: number | null
  cos_phi?: number | null
  load_name?: string | null
  load_type?: string | null
  load_drawing?: string | null
  created_at?: string
  updated_at?: string
}

export type SchemeLineUpdate = Partial<Omit<SchemeLineInsert, 'scheme_id'>>

export type Database = {
  public: {
    Tables: {
      projects: {
        Row: ProjectRow
        Insert: ProjectInsert
        Update: ProjectUpdate
        Relationships: []
      }
      schemes: {
        Row: SchemeRow
        Insert: SchemeInsert
        Update: SchemeUpdate
        Relationships: [
          {
            foreignKeyName: 'schemes_project_id_fkey'
            columns: ['project_id']
            isOneToOne: false
            referencedRelation: 'projects'
            referencedColumns: ['id']
          },
        ]
      }
      scheme_lines: {
        Row: SchemeLineRow
        Insert: SchemeLineInsert
        Update: SchemeLineUpdate
        Relationships: [
          {
            foreignKeyName: 'scheme_lines_scheme_id_fkey'
            columns: ['scheme_id']
            isOneToOne: false
            referencedRelation: 'schemes'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}
