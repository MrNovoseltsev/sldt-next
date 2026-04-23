'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { SchemeRow, SchemeLineRow } from '@/types/database'
import { calcSchemeTotals, calcLineCurrents } from '@/lib/calculations/electrical'
import type { PhasesCount } from '@/types/enums'
import { saveSchemeHeaderAction, saveAllLinesAction } from '@/app/actions/scheme-lines'
import SchemeHeaderForm from './SchemeHeaderForm'
import SchemeLinesTable from './SchemeLinesTable'

type Tab = 'form' | 'lines'

function newLine(schemeId: string, order: number): SchemeLineRow {
  return {
    id: crypto.randomUUID(),
    scheme_id: schemeId,
    line_order: order,
    circuit_breaker_designation: null,
    circuit_breaker_type: null,
    cb_nominal_current: null,
    cb_trip_setting: null,
    cb_protection_type: null,
    cb_differential_current: null,
    cable_designation: null,
    cable_brand: null,
    cable_length: null,
    pipe_designation: null,
    pipe_length: null,
    pipe_marking: null,
    power_kw: null,
    phase_a_current: null,
    phase_b_current: null,
    phase_c_current: null,
    cos_phi: null,
    load_name: null,
    load_type: null,
    load_drawing: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

function coerceNum(v: string): number | null {
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

interface SchemeEditorProps {
  scheme: SchemeRow
  lines: SchemeLineRow[]
  projectId: string
  projectName: string
}

export default function SchemeEditor({ scheme, lines: initialLines, projectId, projectName }: SchemeEditorProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('form')
  const [localScheme, setLocalScheme] = useState<SchemeRow>(scheme)
  const [localLines, setLocalLines] = useState<SchemeLineRow[]>(initialLines)
  const [dirty, setDirty] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const phases = (localScheme.phases_count === 1 ? 1 : 3) as PhasesCount
  const demandCoef = localScheme.demand_coefficient ?? 1

  const totals = calcSchemeTotals(
    localLines.map((l) => ({
      power_kw: l.power_kw,
      cos_phi: l.cos_phi,
      phase_a_current: l.phase_a_current,
      phase_b_current: l.phase_b_current,
      phase_c_current: l.phase_c_current,
    })),
    phases,
    demandCoef,
  )

  const handleSchemeChange = useCallback((field: keyof SchemeRow, value: string) => {
    setLocalScheme((prev) => {
      const numFields: (keyof SchemeRow)[] = [
        'phases_count', 'modules_count', 'nominal_current', 'trip_setting',
        'switching_capacity', 'poles_count', 'differential_current', 'demand_coefficient',
        'installed_power_kva', 'installed_power_current', 'calculated_power_kva',
        'calculated_current', 'current_phase_a', 'current_phase_b', 'current_phase_c',
      ]
      const parsed = numFields.includes(field) ? coerceNum(value) : value
      return { ...prev, [field]: parsed }
    })
    setDirty(true)
    setSavedMsg(false)
  }, [])

  const handleLineChange = useCallback(
    (id: string, field: keyof SchemeLineRow, value: string) => {
      setLocalLines((prev) =>
        prev.map((line) => {
          if (line.id !== id) return line
          const numFields: (keyof SchemeLineRow)[] = [
            'cb_nominal_current', 'cb_trip_setting', 'cb_differential_current',
            'cable_length', 'pipe_length', 'power_kw',
            'phase_a_current', 'phase_b_current', 'phase_c_current', 'cos_phi',
          ]
          const parsed = numFields.includes(field) ? coerceNum(value) : value
          const updated = { ...line, [field]: parsed }

          // Auto-recalculate phase currents when power or cos_phi changes
          if (field === 'power_kw' || field === 'cos_phi') {
            const currents = calcLineCurrents(updated, phases)
            if (currents) {
              updated.phase_a_current = parseFloat(currents.a.toFixed(2))
              updated.phase_b_current = currents.b > 0 ? parseFloat(currents.b.toFixed(2)) : null
              updated.phase_c_current = currents.c > 0 ? parseFloat(currents.c.toFixed(2)) : null
            }
          }
          return updated
        }),
      )
      setDirty(true)
      setSavedMsg(false)
    },
    [phases],
  )

  const handleAddLine = useCallback(() => {
    const maxOrder = localLines.reduce((m, l) => Math.max(m, l.line_order), 0)
    setLocalLines((prev) => [...prev, newLine(scheme.id, maxOrder + 1)])
    setDirty(true)
  }, [localLines, scheme.id])

  const handleDeleteLine = useCallback((id: string) => {
    setLocalLines((prev) => prev.filter((l) => l.id !== id))
    setDirty(true)
    setSavedMsg(false)
  }, [])

  const handleSave = useCallback(() => {
    setSaveError(null)
    startTransition(async () => {
      const schemeData = {
        device_name: localScheme.device_name,
        shell_brand: localScheme.shell_brand,
        shell_code: localScheme.shell_code,
        installation_method: localScheme.installation_method,
        protection_degree: localScheme.protection_degree,
        installation_location: localScheme.installation_location,
        phases_count: localScheme.phases_count,
        network_type: localScheme.network_type,
        power_supply_from: localScheme.power_supply_from,
        modules_count: localScheme.modules_count,
        input_device_type: localScheme.input_device_type,
        nominal_current: localScheme.nominal_current,
        trip_setting: localScheme.trip_setting,
        switching_capacity: localScheme.switching_capacity,
        protection_characteristic: localScheme.protection_characteristic,
        poles_count: localScheme.poles_count,
        differential_current: localScheme.differential_current,
        designation: localScheme.designation,
        demand_coefficient: demandCoef,
        installed_power_kva: totals.installedPowerKva,
        installed_power_current: totals.installedCurrent,
        calculated_power_kva: totals.calculatedPowerKva,
        calculated_current: totals.calculatedCurrent,
        current_phase_a: totals.phaseA,
        current_phase_b: totals.phaseB,
        current_phase_c: totals.phaseC,
      }

      const linesPayload = localLines.map((l, idx) => ({ ...l, line_order: idx + 1 }))

      const [headerResult, linesResult] = await Promise.all([
        saveSchemeHeaderAction(scheme.id, projectId, schemeData),
        saveAllLinesAction(scheme.id, projectId, linesPayload),
      ])

      if (headerResult.error || linesResult.error) {
        setSaveError(headerResult.error ?? linesResult.error)
        return
      }

      setDirty(false)
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2500)
      router.refresh()
    })
  }, [localScheme, localLines, demandCoef, totals, scheme.id, projectId, router])

  // Ctrl+S
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave])

  const schemeName = localScheme.device_name || 'Без названия'
  const tabStyle = (tab: Tab): React.CSSProperties => ({
    fontSize: 12.5,
    color: activeTab === tab ? 'var(--accent)' : 'var(--text-2)',
    padding: '10px 14px',
    borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
    cursor: 'pointer',
    fontWeight: activeTab === tab ? 500 : undefined,
    transition: 'color .15s, border-color .15s',
    background: 'none',
    border: 'none',
    borderBottomWidth: 2,
    borderBottomStyle: 'solid',
    borderBottomColor: activeTab === tab ? 'var(--accent)' : 'transparent',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Form header */}
      <div
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0 20px',
          height: 46,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text-1)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {schemeName} — Принципиальная схема групповой сети
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
            ГОСТ 21.613-2014 · {projectName}
          </div>
        </div>

        {/* Save indicator */}
        {dirty && !savedMsg && (
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-3)',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              whiteSpace: 'nowrap',
            }}
          >
            <span
              style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }}
            />
            Не сохранено
          </span>
        )}
        {savedMsg && (
          <span style={{ fontSize: 11, color: 'var(--status-ok-text)', whiteSpace: 'nowrap' }}>
            ✓ Сохранено
          </span>
        )}
        {saveError && (
          <span style={{ fontSize: 11, color: 'var(--err)', whiteSpace: 'nowrap' }}>
            Ошибка: {saveError}
          </span>
        )}

        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <a
            href={`/api/pdf/${scheme.id}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              border: '1px solid var(--border)',
              color: 'var(--text-2)',
              borderRadius: 5,
              padding: '5px 10px',
              fontSize: 12,
              background: 'none',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'border-color .15s, color .15s',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'var(--text-2)'
              el.style.color = 'var(--text-1)'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = 'var(--border)'
              el.style.color = 'var(--text-2)'
            }}
          >
            PDF
          </a>
          <button
            onClick={handleSave}
            disabled={isPending}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isPending ? 'var(--text-3)' : 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 5,
              padding: '6px 13px',
              fontSize: 12.5,
              fontWeight: 500,
              cursor: isPending ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              transition: 'background .15s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!isPending) (e.currentTarget as HTMLElement).style.background = 'var(--accent-hover)'
            }}
            onMouseLeave={(e) => {
              if (!isPending) (e.currentTarget as HTMLElement).style.background = 'var(--accent)'
            }}
          >
            {isPending ? 'Сохранение…' : 'Сохранить'}
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0 20px',
          display: 'flex',
          gap: 0,
          flexShrink: 0,
        }}
      >
        <button style={tabStyle('form')} onClick={() => setActiveTab('form')}>
          Форма ГОСТ
        </button>
        <button style={tabStyle('lines')} onClick={() => setActiveTab('lines')}>
          Линии ({localLines.length})
        </button>
        <button
          style={{ ...tabStyle('form'), color: 'var(--text-3)', borderBottomColor: 'transparent' }}
          disabled
        >
          Анализ нагрузок
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'form' && (
          <>
            <SchemeHeaderForm scheme={localScheme} totals={totals} onChange={handleSchemeChange} />
            <SchemeLinesTable
              lines={localLines}
              onLineChange={handleLineChange}
              onAddLine={handleAddLine}
              onDeleteLine={handleDeleteLine}
            />
          </>
        )}
        {activeTab === 'lines' && (
          <div style={{ overflowX: 'auto', height: '100%' }}>
            <SchemeLinesTable
              lines={localLines}
              onLineChange={handleLineChange}
              onAddLine={handleAddLine}
              onDeleteLine={handleDeleteLine}
            />
          </div>
        )}
      </div>
    </div>
  )
}
