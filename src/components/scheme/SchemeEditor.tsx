'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { SchemeRow, SchemeLineRow } from '@/types/database'
import { calcSchemeTotals, calcLineCurrents } from '@/lib/calculations/electrical'
import type { PhasesCount } from '@/types/enums'
import { saveSchemeHeaderAction, saveAllLinesAction } from '@/app/actions/scheme-lines'
import { deleteSchemeAction } from '@/app/actions/schemes';
import SchemeHeaderForm from './SchemeHeaderForm'
import SchemeLinesTable from './SchemeLinesTable'
import { cn } from '@/lib/utils'

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
  const [localScheme, setLocalScheme] = useState<SchemeRow>(scheme)
  const [localLines, setLocalLines] = useState<SchemeLineRow[]>(initialLines)
  const [dirty, setDirty] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
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

  const handleDelete = useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    setShowDeleteConfirm(false);
    startTransition(async () => {
      await deleteSchemeAction(scheme.id, projectId);
      router.push(`/projects/${projectId}`);
      router.refresh();
    });
  }, [scheme.id, projectId, router])

  const schemeName = localScheme.device_name || 'Без названия'

  return (
    <>
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/45 flex items-center justify-center z-[1000]"
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteConfirm(false); }}
        >
          <div className="bg-[var(--surface)] border border-border rounded-lg p-6 w-[360px] flex flex-col gap-3">
            <div className="text-sm font-medium text-foreground">
              Удалить схему?
            </div>
            <div className="text-[13px] text-muted-foreground leading-[1.5]">
              «{schemeName}» будет удалена без возможности восстановления.
            </div>
            <div className="flex gap-2 justify-end mt-1">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-[14px] py-[6px] text-[12.5px] border border-border rounded-[5px] bg-transparent text-muted-foreground cursor-pointer font-[inherit]"
              >
                Отмена
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isPending}
                className={cn(
                  'px-[14px] py-[6px] text-[12.5px] border-none rounded-[5px] text-white font-medium font-[inherit]',
                  isPending ? 'bg-[var(--text-3)] cursor-not-allowed' : 'bg-destructive cursor-pointer',
                )}
              >
                {isPending ? 'Удаление…' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Form header */}
        <div className="bg-[var(--surface)] border-b border-border px-5 h-[46px] flex items-center gap-[10px] shrink-0">
          <div className="flex-1 overflow-hidden">
            <div className="text-sm font-medium text-foreground whitespace-nowrap overflow-hidden text-ellipsis">
              {schemeName}
            </div>
            <div className="text-[11px] text-[var(--text-3)] mt-px">
              ГОСТ 21.613-2014 · {projectName}
            </div>
          </div>

          {/* Save indicator */}
          {dirty && !savedMsg && (
            <span className="text-[11px] text-[var(--text-3)] flex items-center gap-1 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
              Не сохранено
            </span>
          )}
          {savedMsg && (
            <span className="text-[11px] text-[var(--status-ok-text)] whitespace-nowrap">
              ✓ Сохранено
            </span>
          )}
          {saveError && (
            <span className="text-[11px] text-destructive whitespace-nowrap">
              Ошибка: {saveError}
            </span>
          )}

          <div className="flex gap-1.5 shrink-0">
            <a
              href={`/api/pdf/${scheme.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-[5px] border border-border text-muted-foreground rounded-[5px] px-[10px] py-[5px] text-xs bg-transparent no-underline whitespace-nowrap transition-colors duration-150 hover:border-[var(--text-2)] hover:text-foreground"
            >
              PDF
            </a>
            <button
              onClick={handleSave}
              disabled={isPending}
              className={cn(
                'flex items-center gap-1.5 text-white border-none rounded-[5px] px-[13px] py-[6px] text-[12.5px] font-medium font-[inherit] whitespace-nowrap transition-colors duration-150',
                isPending
                  ? 'bg-[var(--text-3)] cursor-not-allowed'
                  : 'bg-[var(--accent)] cursor-pointer hover:enabled:bg-[var(--accent-hover)]',
              )}
            >
              {isPending ? 'Сохранение…' : 'Сохранить'}
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className={cn(
                'flex items-center border border-border text-muted-foreground rounded-[5px] px-[10px] py-[5px] text-xs bg-transparent font-[inherit] whitespace-nowrap transition-colors duration-150',
                isPending ? 'cursor-not-allowed' : 'cursor-pointer hover:border-destructive hover:text-destructive',
              )}
            >
              Удалить
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="bg-[var(--surface)] border-b border-border px-5 flex shrink-0">
          <button className="text-[12.5px] text-[var(--accent)] px-[14px] py-[10px] cursor-default font-medium bg-transparent border-none border-b-2 border-b-[var(--accent)] font-[inherit] whitespace-nowrap">
            Форма ГОСТ
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <SchemeHeaderForm scheme={localScheme} totals={totals} onChange={handleSchemeChange} />
          <SchemeLinesTable
            lines={localLines}
            onLineChange={handleLineChange}
            onAddLine={handleAddLine}
            onDeleteLine={handleDeleteLine}
          />
        </div>
      </div>
    </>
  )
}
