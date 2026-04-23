import type { SchemeLineRow } from '@/types/database'

const CURVES = ['', 'A', 'B', 'C', 'D', 'K'] as const

const th1: React.CSSProperties = {
  background: 'var(--bg)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '.05em',
  textTransform: 'uppercase',
  color: 'var(--text-2)',
  padding: '6px 10px',
  textAlign: 'center',
  border: '1px solid var(--border-light)',
  whiteSpace: 'nowrap',
}
const th2: React.CSSProperties = {
  background: 'var(--bg)',
  fontSize: 10,
  color: 'var(--text-3)',
  padding: '4px 8px',
  fontWeight: 400,
  whiteSpace: 'nowrap',
  textAlign: 'center',
  border: '1px solid var(--border-light)',
}
const td: React.CSSProperties = {
  height: 36,
  border: '1px solid var(--border-light)',
  padding: 0,
}
const cellInput = (mono?: boolean): React.CSSProperties => ({
  border: 'none',
  outline: 'none',
  width: '100%',
  height: '100%',
  padding: '0 8px',
  fontSize: 12,
  color: 'var(--text-1)',
  background: 'transparent',
  fontFamily: mono ? 'var(--font-mono)' : 'inherit',
  fontVariantNumeric: 'slashed-zero',
  textAlign: mono ? 'center' : undefined,
})

interface SchemeLinesTableProps {
  lines: SchemeLineRow[]
  onLineChange: (id: string, field: keyof SchemeLineRow, value: string) => void
  onAddLine: () => void
  onDeleteLine: (id: string) => void
}

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
  return (
    <input
      value={value ?? ''}
      placeholder={placeholder ?? ''}
      onChange={(e) => onChange(e.target.value)}
      style={cellInput(mono)}
      onFocus={(e) => (e.currentTarget.style.background = 'var(--accent-bg)')}
      onBlur={(e) => (e.currentTarget.style.background = 'transparent')}
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
      style={{
        ...cellInput(),
        cursor: 'pointer',
      }}
      onFocus={(e) => (e.currentTarget.style.background = 'var(--accent-bg)')}
      onBlur={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o || '—'}
        </option>
      ))}
    </select>
  )
}

export default function SchemeLinesTable({
  lines,
  onLineChange,
  onAddLine,
  onDeleteLine,
}: SchemeLinesTableProps) {
  const upd = (id: string, field: keyof SchemeLineRow) => (v: string) => onLineChange(id, field, v)

  return (
    <div style={{ background: 'var(--surface)' }}>
      {/* Section header */}
      <div
        style={{
          padding: '10px 20px 9px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'var(--bg)',
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '.06em',
            textTransform: 'uppercase',
            color: 'var(--text-2)',
            flex: 1,
          }}
        >
          Линии и электроприёмники
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{lines.length} записей</span>
        <button
          onClick={onAddLine}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            border: '1px solid var(--border)',
            color: 'var(--text-2)',
            borderRadius: 5,
            padding: '4px 9px',
            fontSize: 11.5,
            background: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
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
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            borderCollapse: 'collapse',
            width: 'max-content',
            minWidth: '100%',
          }}
        >
          <thead>
            <tr>
              <th rowSpan={2} style={{ ...th1, width: 32, minWidth: 32 }}>
                №
              </th>
              <th colSpan={6} style={th1}>
                Аппарат отходящей линии (ввода)
              </th>
              <th colSpan={3} style={th1}>
                Кабель, провод
              </th>
              <th colSpan={2} style={th1}>
                Труба
              </th>
              <th style={th1}>
                Руст/
                <br />
                Рном, кВт
              </th>
              <th colSpan={3} style={th1}>
                Iном по фазам, А
              </th>
              <th style={th1}>cos φ</th>
              <th colSpan={3} style={th1}>
                Электроприёмник
              </th>
              <th rowSpan={2} style={{ ...th1, width: 30 }} />
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
                <th key={i} style={th2}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td
                  colSpan={21}
                  style={{
                    textAlign: 'center',
                    padding: '28px',
                    color: 'var(--text-3)',
                    fontSize: 12,
                    border: '1px solid var(--border-light)',
                  }}
                >
                  Нет линий.{' '}
                  <button
                    onClick={onAddLine}
                    style={{
                      color: 'var(--accent)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 12,
                    }}
                  >
                    Добавить первую →
                  </button>
                </td>
              </tr>
            ) : (
              lines.map((line, idx) => (
                <tr
                  key={line.id}
                  onMouseEnter={(e) => {
                    Array.from((e.currentTarget as HTMLElement).querySelectorAll('td')).forEach(
                      (cell) => {
                        if (!(cell.querySelector('input:focus, select:focus')))
                          (cell as HTMLElement).style.background = '#f4f3f0'
                      },
                    )
                  }}
                  onMouseLeave={(e) => {
                    Array.from((e.currentTarget as HTMLElement).querySelectorAll('td')).forEach(
                      (cell) => {
                        if (!(cell.querySelector('input:focus, select:focus')))
                          (cell as HTMLElement).style.background = 'transparent'
                      },
                    )
                  }}
                >
                  {/* Row number */}
                  <td
                    style={{
                      ...td,
                      textAlign: 'center',
                      fontSize: 11,
                      color: 'var(--text-3)',
                      width: 32,
                      minWidth: 32,
                      background: 'var(--bg)',
                      userSelect: 'none',
                    }}
                  >
                    {idx + 1}
                  </td>

                  {/* Circuit breaker */}
                  <td style={{ ...td, minWidth: 60 }}>
                    <CellInput value={line.circuit_breaker_designation} onChange={upd(line.id, 'circuit_breaker_designation')} placeholder="QFx" />
                  </td>
                  <td style={{ ...td, minWidth: 160 }}>
                    <CellInput value={line.circuit_breaker_type} onChange={upd(line.id, 'circuit_breaker_type')} placeholder="Тип" />
                  </td>
                  <td style={{ ...td, minWidth: 60 }}>
                    <CellInput value={line.cb_nominal_current} onChange={upd(line.id, 'cb_nominal_current')} placeholder="А" mono />
                  </td>
                  <td style={{ ...td, minWidth: 60 }}>
                    <CellInput value={line.cb_trip_setting} onChange={upd(line.id, 'cb_trip_setting')} placeholder="А" mono />
                  </td>
                  <td style={{ ...td, minWidth: 60 }}>
                    <CellSelect value={line.cb_protection_type} options={CURVES} onChange={upd(line.id, 'cb_protection_type')} />
                  </td>
                  <td style={{ ...td, minWidth: 60 }}>
                    <CellInput value={line.cb_differential_current} onChange={upd(line.id, 'cb_differential_current')} placeholder="мА" mono />
                  </td>

                  {/* Cable */}
                  <td style={{ ...td, minWidth: 60 }}>
                    <CellInput value={line.cable_designation} onChange={upd(line.id, 'cable_designation')} placeholder="Wn" />
                  </td>
                  <td style={{ ...td, minWidth: 90 }}>
                    <CellInput value={line.cable_brand} onChange={upd(line.id, 'cable_brand')} placeholder="Марка" />
                  </td>
                  <td style={{ ...td, minWidth: 60 }}>
                    <CellInput value={line.cable_length} onChange={upd(line.id, 'cable_length')} placeholder="м" mono />
                  </td>

                  {/* Pipe */}
                  <td style={{ ...td, minWidth: 90 }}>
                    <CellInput value={line.pipe_designation} onChange={upd(line.id, 'pipe_designation')} placeholder="—" />
                  </td>
                  <td style={{ ...td, minWidth: 60 }}>
                    <CellInput value={line.pipe_length} onChange={upd(line.id, 'pipe_length')} placeholder="м" mono />
                  </td>

                  {/* Power */}
                  <td style={{ ...td, minWidth: 60 }}>
                    <CellInput value={line.power_kw} onChange={upd(line.id, 'power_kw')} placeholder="кВт" mono />
                  </td>

                  {/* Phase currents */}
                  <td style={{ ...td, minWidth: 60 }}>
                    <CellInput value={line.phase_a_current} onChange={upd(line.id, 'phase_a_current')} placeholder="А" mono />
                  </td>
                  <td style={{ ...td, minWidth: 60 }}>
                    <CellInput value={line.phase_b_current} onChange={upd(line.id, 'phase_b_current')} placeholder="А" mono />
                  </td>
                  <td style={{ ...td, minWidth: 60 }}>
                    <CellInput value={line.phase_c_current} onChange={upd(line.id, 'phase_c_current')} placeholder="А" mono />
                  </td>

                  {/* cos phi */}
                  <td style={{ ...td, minWidth: 60 }}>
                    <CellInput value={line.cos_phi} onChange={upd(line.id, 'cos_phi')} placeholder="0.xx" mono />
                  </td>

                  {/* Load */}
                  <td style={{ ...td, minWidth: 160 }}>
                    <CellInput value={line.load_name} onChange={upd(line.id, 'load_name')} placeholder="Наименование" />
                  </td>
                  <td style={{ ...td, minWidth: 90 }}>
                    <CellInput value={line.load_drawing} onChange={upd(line.id, 'load_drawing')} placeholder="Ссылка" />
                  </td>
                  <td style={{ ...td, minWidth: 90 }}>
                    <CellInput value={line.load_type} onChange={upd(line.id, 'load_type')} placeholder="Тип" />
                  </td>

                  {/* Delete */}
                  <td style={{ ...td, width: 30 }}>
                    <button
                      onClick={() => onDeleteLine(line.id)}
                      title="Удалить строку"
                      style={{
                        width: '100%',
                        height: 36,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-3)',
                        fontSize: 16,
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'color .12s, background .12s',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLElement
                        el.style.color = 'var(--err)'
                        el.style.background = 'var(--err-bg)'
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLElement
                        el.style.color = 'var(--text-3)'
                        el.style.background = 'none'
                      }}
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
