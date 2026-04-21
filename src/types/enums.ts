export const PHASES_COUNT_VALUES = [1, 3] as const
export type PhasesCount = (typeof PHASES_COUNT_VALUES)[number]

export const INPUT_DEVICE_TYPES = [
  'circuit_breaker',
  'circuit_breaker_with_rcd',
  'fuse',
  'switch_disconnector',
] as const satisfies readonly string[]
export type InputDeviceType = (typeof INPUT_DEVICE_TYPES)[number]

export const PROTECTION_CHARACTERISTICS = ['B', 'C', 'D'] as const satisfies readonly string[]
export type ProtectionCharacteristic = (typeof PROTECTION_CHARACTERISTICS)[number]

export const CB_PROTECTION_TYPES = [
  'overcurrent',
  'differential',
  'overcurrent_differential',
] as const satisfies readonly string[]
export type CbProtectionType = (typeof CB_PROTECTION_TYPES)[number]

export const LOAD_TYPES = [
  'lighting',
  'socket',
  'hvac',
  'motor',
  'heating',
  'other',
] as const satisfies readonly string[]
export type LoadType = (typeof LOAD_TYPES)[number]
