import { useState } from 'react'
import type { SchemeLineRow } from '@/types/database'
import { cn } from '@/lib/utils'

const CURVES = ['', 'A', 'B', 'C', 'D', 'K'] as const

function CellInput({
  value,
  onChange,
  placeholder,
  mono,
}: {
  value: string | number | null
  onChange: (v: string) => void
  placeholder?: string
  mono?: boolean
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      value={value ?? ''}
      placeholder={focused ? '' : (placeholder ?? '')}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'border-none outline-none w-full h-full px-[8px] text-xs text-foreground bg-transparent font-[inherit] slashed-zero focus:bg-accent',
        mono && 'font-mono text-center',
      )}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  )
}

function CellSelect({
  value,
  options,
  onChange,
}: {
  value: string | null
  options: readonly string[]
  onChange: (v: string) => void
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      className="border-none outline-none w-full h-full px-[8px] text-xs text-foreground bg-transparent font-[inherit] cursor-pointer focus:bg-accent"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o || '—'}
        </option>
      ))}
    </select>
  )
}

interface SchemeLinesTableProps {
  lines: SchemeLineRow[]
  onLineChange: (id: string, field: keyof SchemeLineRow, value: string) => void
  onAddLine: () => void
  onDeleteLine: (id: string) => void
}

export default function SchemeLinesTable({
  lines,
  onLineChange,
  onAddLine,
  onDeleteLine,
}: SchemeLinesTableProps) {
  const upd = (id: string, field: keyof SchemeLineRow) => (v: string) => onLineChange(id, field, v)

  const th1 = 'bg-[var(--bg)] text-[10px] font-semibold tracking-[.05em] uppercase text-muted-foreground px-[10px] py-[6px] text-center border border-[var(--border-light)] whitespace-nowrap'
  const th2 = 'bg-[var(--bg)] text-[10px] text-[var(--text-3)] px-[8px] py-[4px] font-normal whitespace-nowrap text-center border border-[var(--border-light)]'
  const tdBase = 'h-9 border border-[var(--border-light)] p-0'

  return (
    <div className="bg-[var(--surface)]">
      {/* Section header */}
      <div className="px-5 pt-[10px] pb-[9px] border-b border-border flex items-center gap-[10px] bg-[var(--bg)]">
        <span className="text-[10px] font-semibold tracking-[.06em] uppercase text-muted-foreground flex-1">
          Линии и электроприёмники
        </span>
        <span className="text-[11px] text-[var(--text-3)]">{lines.length} записей</span>
        <button
          onClick={onAddLine}
          className="flex items-center gap-[5px] border border-border text-muted-foreground rounded-[5px] px-[9px] py-[4px] text-[11.5px] bg-transparent cursor-pointer font-[inherit] transition-colors duration-150 hover:border-[var(--text-2)] hover:text-foreground"
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M8 2v12M2 8h12" />
          </svg>
          Добавить линию
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="border-collapse w-max min-w-full">
          <thead>
            <tr>
              <th rowSpan={2} className={cn(th1, 'w-8 min-w-[32px]')}>
                №
              </th>
              <th colSpan={6} className={th1}>
                Аппарат отходящей линии (ввода)
              </th>
              <th colSpan={3} className={th1}>
                Кабель, провод
              </th>
              <th colSpan={2} className={th1}>
                Труба
              </th>
              <th className={th1}>
                Руст/
                <br />
                Рном, кВт
              </th>
              <th colSpan={3} className={th1}>
                Iном по фазам, А
              </th>
              <th className={th1}>cos φ</th>
              <th colSpan={3} className={th1}>
                Электроприёмник
              </th>
              <th rowSpan={2} className={cn(th1, 'w-[30px]')} />
            </tr>
            <tr>
              {[
                'Обозначение',
                'Тип',
                'Iном, А',
                'Iуст, А',
                'Хар-ка',
                'Iдиф, мА',
                'Обозначение',
                'Марка',
                'Длина, м',
                'Обозначение',
                'Длина, м',
                '',
                'Фаза А',
                'Фаза В',
                'Фаза С',
                '',
                'Наименование, тип',
                'Чертёж схемы',
                'Обозначение',
              ].map((h, i) => (
                <th key={i} className={th2}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.length > 0 && (
              lines.map((line, idx) => (
                <tr key={line.id} className="[&:hover_td]:bg-[#f4f3f0]">
                  {/* Row number */}
                  <td className={cn(tdBase, 'text-center text-[11px] text-[var(--text-3)] w-8 min-w-[32px] bg-[var(--bg)] select-none')}>
                    {idx + 1}
                  </td>

                  {/* Circuit breaker */}
                  <td className={cn(tdBase, 'min-w-[60px]')}>
                    <CellInput value={line.circuit_breaker_designation} onChange={upd(line.id, 'circuit_breaker_designation')} placeholder="QFx" />
                  </td>
                  <td className={cn(tdBase, 'min-w-[160px]')}>
                    <CellInput value={line.circuit_breaker_type} onChange={upd(line.id, 'circuit_breaker_type')} placeholder="Тип" />
                  </td>
                  <td className={cn(tdBase, 'min-w-[60px]')}>
                    <CellInput value={line.cb_nominal_current} onChange={upd(line.id, 'cb_nominal_current')} placeholder="А" mono />
                  </td>
                  <td className={cn(tdBase, 'min-w-[60px]')}>
                    <CellInput value={line.cb_trip_setting} onChange={upd(line.id, 'cb_trip_setting')} placeholder="А" mono />
                  </td>
                  <td className={cn(tdBase, 'min-w-[60px]')}>
                    <CellSelect value={line.cb_protection_type} options={CURVES} onChange={upd(line.id, 'cb_protection_type')} />
                  </td>
                  <td className={cn(tdBase, 'min-w-[60px]')}>
                    <CellInput value={line.cb_differential_current} onChange={upd(line.id, 'cb_differential_current')} placeholder="мА" mono />
                  </td>

                  {/* Cable */}
                  <td className={cn(tdBase, 'min-w-[60px]')}>
                    <CellInput value={line.cable_designation} onChange={upd(line.id, 'cable_designation')} placeholder="Wn" />
                  </td>
                  <td className={cn(tdBase, 'min-w-[90px]')}>
                    <CellInput value={line.cable_brand} onChange={upd(line.id, 'cable_brand')} placeholder="Марка" />
                  </td>
                  <td className={cn(tdBase, 'min-w-[60px]')}>
                    <CellInput value={line.cable_length} onChange={upd(line.id, 'cable_length')} placeholder="м" mono />
                  </td>

                  {/* Pipe */}
                  <td className={cn(tdBase, 'min-w-[90px]')}>
                    <CellInput value={line.pipe_designation} onChange={upd(line.id, 'pipe_designation')} placeholder="—" />
                  </td>
                  <td className={cn(tdBase, 'min-w-[60px]')}>
                    <CellInput value={line.pipe_length} onChange={upd(line.id, 'pipe_length')} placeholder="м" mono />
                  </td>

                  {/* Power */}
                  <td className={cn(tdBase, 'min-w-[60px]')}>
                    <CellInput value={line.power_kw} onChange={upd(line.id, 'power_kw')} placeholder="кВт" mono />
                  </td>

                  {/* Phase currents */}
                  <td className={cn(tdBase, 'min-w-[60px]')}>
                    <CellInput value={line.phase_a_current} onChange={upd(line.id, 'phase_a_current')} placeholder="А" mono />
                  </td>
                  <td className={cn(tdBase, 'min-w-[60px]')}>
                    <CellInput value={line.phase_b_current} onChange={upd(line.id, 'phase_b_current')} placeholder="А" mono />
                  </td>
                  <td className={cn(tdBase, 'min-w-[60px]')}>
                    <CellInput value={line.phase_c_current} onChange={upd(line.id, 'phase_c_current')} placeholder="А" mono />
                  </td>

                  {/* cos phi */}
                  <td className={cn(tdBase, 'min-w-[60px]')}>
                    <CellInput value={line.cos_phi} onChange={upd(line.id, 'cos_phi')} placeholder="0.xx" mono />
                  </td>

                  {/* Load */}
                  <td className={cn(tdBase, 'min-w-[160px]')}>
                    <CellInput value={line.load_name} onChange={upd(line.id, 'load_name')} placeholder="Наименование" />
                  </td>
                  <td className={cn(tdBase, 'min-w-[90px]')}>
                    <CellInput value={line.load_drawing} onChange={upd(line.id, 'load_drawing')} placeholder="Ссылка" />
                  </td>
                  <td className={cn(tdBase, 'min-w-[90px]')}>
                    <CellInput value={line.load_type} onChange={upd(line.id, 'load_type')} placeholder="Тип" />
                  </td>

                  {/* Delete */}
                  <td className={cn(tdBase, 'w-[30px]')}>
                    <button
                      onClick={() => onDeleteLine(line.id)}
                      title="Удалить строку"
                      className="w-full h-9 flex items-center justify-center text-[var(--text-3)] text-base bg-transparent border-none cursor-pointer transition-colors duration-[120ms] hover:text-destructive hover:bg-[var(--err-bg)]"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
