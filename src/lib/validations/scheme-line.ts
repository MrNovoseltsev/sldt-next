import { z } from 'zod'
import { CB_PROTECTION_TYPES, LOAD_TYPES } from '@/types/enums'

const optionalString = z.string().max(255).optional()
const optionalPositiveNumber = z.coerce.number().positive().optional()
const optionalNonNegativeNumber = z.coerce.number().nonnegative().optional()

export const schemeLineSchema = z.object({
  id: z.string().uuid().optional(),
  scheme_id: z.string().uuid(),
  line_order: z.coerce.number().int().nonnegative(),

  // Column A — автоматический выключатель
  circuit_breaker_designation: optionalString,
  circuit_breaker_type: optionalString,
  cb_nominal_current: optionalPositiveNumber,
  cb_trip_setting: optionalPositiveNumber,
  cb_protection_type: z.enum(CB_PROTECTION_TYPES).optional(),
  cb_differential_current: optionalPositiveNumber,

  // Columns B/C/D — кабель
  cable_designation: optionalString,
  cable_brand: optionalString,
  cable_length: optionalPositiveNumber,

  // Columns E/F/G — труба/короб
  pipe_designation: optionalString,
  pipe_length: optionalPositiveNumber,
  pipe_marking: optionalString,

  // Column H — мощность
  power_kw: optionalNonNegativeNumber,

  // Columns I/J/K — токи по фазам
  phase_a_current: optionalNonNegativeNumber,
  phase_b_current: optionalNonNegativeNumber,
  phase_c_current: optionalNonNegativeNumber,

  // Column L — cos φ
  cos_phi: z.coerce.number().min(0.01).max(1.0).optional(),

  // Columns M/N/O — электроприёмник
  load_name: z.string().max(500).optional(),
  load_type: z.enum(LOAD_TYPES).optional(),
  load_drawing: optionalString,
})

export type SchemeLineFormValues = z.infer<typeof schemeLineSchema>
