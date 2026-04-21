import type { z } from 'zod'
import type {
  projectSchema,
  schemeSchema,
  schemeLineSchema,
} from '@/lib/validations'

export {
  PHASES_COUNT_VALUES,
  INPUT_DEVICE_TYPES,
  PROTECTION_CHARACTERISTICS,
  CB_PROTECTION_TYPES,
  LOAD_TYPES,
} from '@/types/enums'

export type {
  PhasesCount,
  InputDeviceType,
  ProtectionCharacteristic,
  CbProtectionType,
  LoadType,
} from '@/types/enums'

export type Project = z.infer<typeof projectSchema>
export type Scheme = z.infer<typeof schemeSchema>
export type SchemeLine = z.infer<typeof schemeLineSchema>
