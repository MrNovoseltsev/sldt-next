import type { PhasesCount } from '@/types/enums'

const SQRT3 = Math.sqrt(3)
const U3 = 0.38 // кВ, 3-фазная сеть
const U1 = 0.22 // кВ, 1-фазная сеть

export function calcCurrent(powerKw: number, cosPhi: number, phases: PhasesCount): number {
  if (phases === 3) return powerKw / (SQRT3 * U3 * cosPhi)
  return powerKw / (U1 * cosPhi)
}

export function calcApparentPower(powerKw: number, cosPhi: number): number {
  return powerKw / cosPhi
}

export function calcDemandPower(installedKw: number, demandCoef: number): number {
  return installedKw * demandCoef
}

type LineInput = {
  power_kw?: number | null
  cos_phi?: number | null
  phase_a_current?: number | null
  phase_b_current?: number | null
  phase_c_current?: number | null
}

export type SchemeTotals = {
  installedPowerKva: number
  installedCurrent: number
  calculatedPowerKva: number
  calculatedCurrent: number
  phaseA: number
  phaseB: number
  phaseC: number
}

export function calcLineCurrents(
  line: LineInput,
  phases: PhasesCount,
): { a: number; b: number; c: number } | null {
  const { power_kw, cos_phi } = line
  if (power_kw == null || cos_phi == null || cos_phi === 0) return null
  const current = calcCurrent(power_kw, cos_phi, phases)
  if (phases === 3) return { a: current, b: current, c: current }
  return { a: current, b: 0, c: 0 }
}

export function calcSchemeTotals(
  lines: LineInput[],
  phases: PhasesCount,
  demandCoef: number,
): SchemeTotals {
  let installedPowerKva = 0
  let installedCurrent = 0
  let phaseA = 0
  let phaseB = 0
  let phaseC = 0

  for (const line of lines) {
    if (line.power_kw != null && line.cos_phi != null && line.cos_phi > 0) {
      installedPowerKva += calcApparentPower(line.power_kw, line.cos_phi)
      installedCurrent += calcCurrent(line.power_kw, line.cos_phi, phases)
    }
    phaseA += line.phase_a_current ?? 0
    phaseB += line.phase_b_current ?? 0
    phaseC += line.phase_c_current ?? 0
  }

  return {
    installedPowerKva,
    installedCurrent,
    calculatedPowerKva: installedPowerKva * demandCoef,
    calculatedCurrent: installedCurrent * demandCoef,
    phaseA,
    phaseB,
    phaseC,
  }
}
