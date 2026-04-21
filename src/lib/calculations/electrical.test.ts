import { describe, it, expect } from 'vitest'
import {
  calcCurrent,
  calcApparentPower,
  calcDemandPower,
  calcLineCurrents,
  calcSchemeTotals,
} from './electrical'

const SQRT3 = Math.sqrt(3)

describe('calcCurrent', () => {
  it('3-фаз: P=10кВт, cosφ=0.85', () => {
    expect(calcCurrent(10, 0.85, 3)).toBeCloseTo(10 / (SQRT3 * 0.38 * 0.85), 5)
  })

  it('1-фаз: P=1кВт, cosφ=0.9', () => {
    expect(calcCurrent(1, 0.9, 1)).toBeCloseTo(1 / (0.22 * 0.9), 5)
  })

  it('3-фаз: P=0 → ток 0', () => {
    expect(calcCurrent(0, 0.85, 3)).toBe(0)
  })
})

describe('calcApparentPower', () => {
  it('P=10, cosφ=0.85 → S≈11.765 кВА', () => {
    expect(calcApparentPower(10, 0.85)).toBeCloseTo(10 / 0.85, 5)
  })

  it('P=5, cosφ=1.0 → S=5 кВА', () => {
    expect(calcApparentPower(5, 1.0)).toBeCloseTo(5, 5)
  })
})

describe('calcDemandPower', () => {
  it('20кВт × Ксп=0.7 → 14кВт', () => {
    expect(calcDemandPower(20, 0.7)).toBeCloseTo(14, 5)
  })

  it('Ксп=1.0 не изменяет мощность', () => {
    expect(calcDemandPower(15, 1.0)).toBeCloseTo(15, 5)
  })
})

describe('calcLineCurrents', () => {
  it('3-фаз: ток равномерно по фазам A/B/C', () => {
    const expected = 10 / (SQRT3 * 0.38 * 0.85)
    const result = calcLineCurrents({ power_kw: 10, cos_phi: 0.85 }, 3)
    expect(result).toEqual({
      a: expect.closeTo(expected, 5),
      b: expect.closeTo(expected, 5),
      c: expect.closeTo(expected, 5),
    })
  })

  it('1-фаз: ток только на фазе A, B=C=0', () => {
    const expected = 1 / (0.22 * 0.9)
    const result = calcLineCurrents({ power_kw: 1, cos_phi: 0.9 }, 1)
    expect(result).toEqual({ a: expect.closeTo(expected, 5), b: 0, c: 0 })
  })

  it('возвращает null при отсутствии power_kw', () => {
    expect(calcLineCurrents({ cos_phi: 0.85 }, 3)).toBeNull()
  })

  it('возвращает null при отсутствии cos_phi', () => {
    expect(calcLineCurrents({ power_kw: 10 }, 3)).toBeNull()
  })

  it('возвращает null при cos_phi = 0', () => {
    expect(calcLineCurrents({ power_kw: 10, cos_phi: 0 }, 3)).toBeNull()
  })
})

describe('calcSchemeTotals', () => {
  const lines = [
    { power_kw: 10, cos_phi: 0.85, phase_a_current: 5, phase_b_current: 5, phase_c_current: 5 },
    { power_kw: 5, cos_phi: 0.9, phase_a_current: 3, phase_b_current: 3, phase_c_current: 3 },
  ]

  it('суммирует установленную мощность кВА', () => {
    const totals = calcSchemeTotals(lines, 3, 0.8)
    expect(totals.installedPowerKva).toBeCloseTo(10 / 0.85 + 5 / 0.9, 4)
  })

  it('суммирует установленный ток', () => {
    const totals = calcSchemeTotals(lines, 3, 0.8)
    const expected =
      10 / (SQRT3 * 0.38 * 0.85) + 5 / (SQRT3 * 0.38 * 0.9)
    expect(totals.installedCurrent).toBeCloseTo(expected, 4)
  })

  it('применяет коэффициент спроса к мощности', () => {
    const totals = calcSchemeTotals(lines, 3, 0.8)
    expect(totals.calculatedPowerKva).toBeCloseTo(totals.installedPowerKva * 0.8, 4)
  })

  it('применяет коэффициент спроса к току', () => {
    const totals = calcSchemeTotals(lines, 3, 0.8)
    expect(totals.calculatedCurrent).toBeCloseTo(totals.installedCurrent * 0.8, 4)
  })

  it('суммирует токи по фазам из входных данных строк', () => {
    const totals = calcSchemeTotals(lines, 3, 0.8)
    expect(totals.phaseA).toBeCloseTo(8, 5)
    expect(totals.phaseB).toBeCloseTo(8, 5)
    expect(totals.phaseC).toBeCloseTo(8, 5)
  })

  it('пропускает строки без power_kw/cos_phi, но учитывает их токи по фазам', () => {
    const linesWithGap = [...lines, { phase_a_current: 2, phase_b_current: 0, phase_c_current: 0 }]
    const totals = calcSchemeTotals(linesWithGap, 3, 0.8)
    expect(totals.phaseA).toBeCloseTo(10, 5)
    expect(totals.installedPowerKva).toBeCloseTo(10 / 0.85 + 5 / 0.9, 4)
  })

  it('возвращает нули для пустого массива строк', () => {
    const totals = calcSchemeTotals([], 3, 0.8)
    expect(totals).toEqual({
      installedPowerKva: 0,
      installedCurrent: 0,
      calculatedPowerKva: 0,
      calculatedCurrent: 0,
      phaseA: 0,
      phaseB: 0,
      phaseC: 0,
    })
  })
})
