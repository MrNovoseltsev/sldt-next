import { z } from 'zod'
import { INPUT_DEVICE_TYPES, PROTECTION_CHARACTERISTICS } from '@/types/enums'

const optionalString = z.string().max(255).optional()
const optionalPositiveNumber = z.coerce.number().positive().optional()

export const schemeSchema = z.object({
  id: z.string().uuid().optional(),
  project_id: z.string().uuid(),

  // Left group — РУ
  device_name: optionalString,
  shell_brand: optionalString,
  shell_code: optionalString,
  installation_method: optionalString,
  protection_degree: optionalString,
  installation_location: optionalString,
  phases_count: z.union([z.literal(1), z.literal(3)]).optional(),
  network_type: optionalString,
  power_supply_from: optionalString,
  modules_count: z.coerce.number().int().positive().optional(),

  // Middle group — аппарат до ввода
  input_device_type: z.enum(INPUT_DEVICE_TYPES).optional(),
  nominal_current: optionalPositiveNumber,
  trip_setting: optionalPositiveNumber,
  switching_capacity: optionalPositiveNumber,
  protection_characteristic: z.enum(PROTECTION_CHARACTERISTICS).optional(),
  poles_count: z.coerce.number().int().min(1).max(4).optional(),
  differential_current: optionalPositiveNumber,
  designation: optionalString,
  cable_info: z.string().max(500).optional(),

  // Right group — итоговые нагрузки
  installed_power_kva: optionalPositiveNumber,
  installed_power_current: optionalPositiveNumber,
  calculated_power_kva: optionalPositiveNumber,
  calculated_current: optionalPositiveNumber,
  demand_coefficient: z.coerce.number().min(0).max(1).optional(),
  current_phase_a: optionalPositiveNumber,
  current_phase_b: optionalPositiveNumber,
  current_phase_c: optionalPositiveNumber,
})

export type SchemeFormValues = z.infer<typeof schemeSchema>
