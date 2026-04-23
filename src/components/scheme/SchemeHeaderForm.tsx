import type { SchemeRow } from '@/types/database'
import type { SchemeTotals } from '@/lib/calculations/electrical'

// Field styles matching Form Editor.html
const fieldRow: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  alignItems: 'stretch',
  borderBottom: '1px solid var(--border-light)',
  minHeight: 32,
}
const fieldLabel: React.CSSProperties = {
  fontSize: 11.5,
  color: 'var(--text-2)',
  padding: '7px 10px 7px 14px',
  lineHeight: 1.35,
  display: 'flex',
  alignItems: 'center',
}
const inputCell = (wide?: boolean, calculated?: boolean): React.CSSProperties => ({
  borderLeft: '1px solid var(--border-light)',
  minWidth: wide ? 130 : 90,
  display: 'flex',
  alignItems: 'stretch',
  background: calculated ? 'var(--bg)' : undefined,
})
const inputStyle = (calculated?: boolean): React.CSSProperties => ({
  border: 'none',
  outline: 'none',
  background: 'transparent',
  width: '100%',
  padding: '0 10px',
  fontSize: 12,
  color: calculated ? 'var(--accent)' : 'var(--text-1)',
  fontWeight: calculated ? 500 : undefined,
  fontFamily: 'inherit',
  fontVariantNumeric: 'slashed-zero',
  cursor: calculated ? 'default' : undefined,
})

interface FieldProps {
  label: string
  value: string
  onChange?: (v: string) => void
  options?: readonly string[]
  wide?: boolean
  calculated?: boolean
  placeholder?: string
}

function Field({ label, value, onChange, options, wide, calculated, placeholder }: FieldProps) {
  return (
    <div style={fieldRow}>
      <div style={fieldLabel}>{label}</div>
      <div style={inputCell(wide, calculated)}>
        {options ? (
          <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            style={{ ...inputStyle(), cursor: 'pointer' }}
            onFocus={(e) => !calculated && (e.currentTarget.style.background = 'var(--accent-bg)')}
            onBlur={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            {options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            value={value}
            readOnly={calculated}
            placeholder={placeholder ?? '—'}
            onChange={(e) => onChange?.(e.target.value)}
            style={inputStyle(calculated)}
            onFocus={(e) => !calculated && (e.currentTarget.style.background = 'var(--accent-bg)')}
            onBlur={(e) => (e.currentTarget.style.background = 'transparent')}
          />
        )}
      </div>
    </div>
  )
}

const blockHeader: React.CSSProperties = {
  padding: '10px 14px 9px',
  borderBottom: '1px solid var(--border)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  color: 'var(--text-2)',
  lineHeight: 1.4,
  background: 'var(--bg)',
}

const INSTALLATION_METHODS = ['Напольный', 'Настенный', 'Встраиваемый', 'Стоечный'] as const
const PROTECTION_DEGREES = ['IP20', 'IP31', 'IP40', 'IP44', 'IP54', 'IP65'] as const
const PHASES_OPTIONS = ['1', '3'] as const
const NETWORK_TYPES = ['TN-C', 'TN-S', 'TN-C-S', 'TT', 'IT'] as const
const DEVICE_TYPES = ['АВ 1P', 'АВ 2P', 'АВ 3P', 'АВ 4P', 'АВДТ 1P', 'АВДТ 2P', 'УЗО 2P', 'УЗО 4P', 'Рубильник', 'Предохранитель'] as const
const CURVES = ['A', 'B', 'C', 'D', 'K'] as const
const POLES = ['1', '2', '3', '4'] as const

function fmt(n: number | null | undefined, decimals = 1): string {
  if (n == null) return '—'
  return n.toFixed(decimals)
}

interface SchemeHeaderFormProps {
  scheme: SchemeRow
  totals: SchemeTotals
  onChange: (field: keyof SchemeRow, value: string) => void
}

export default function SchemeHeaderForm({ scheme, totals, onChange }: SchemeHeaderFormProps) {
  const s = (field: keyof SchemeRow) => (v: string) => onChange(field, v)

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}
    >
      {/* LEFT — РУ */}
      <div style={{ borderRight: '1px solid var(--border)' }}>
        <div style={blockHeader}>Данные распределительного устройства</div>
        <Field label="Распределительное устройство" value={scheme.device_name ?? ''} onChange={s('device_name')} wide />
        <Field label="Марка оболочки" value={scheme.shell_brand ?? ''} onChange={s('shell_brand')} wide />
        <Field label="Код оболочки" value={scheme.shell_code ?? ''} onChange={s('shell_code')} />
        <Field label="Способ монтажа" value={scheme.installation_method ?? INSTALLATION_METHODS[0]} onChange={s('installation_method')} options={INSTALLATION_METHODS} />
        <Field label="Степень защиты по ГОСТ 14.254-96" value={scheme.protection_degree ?? PROTECTION_DEGREES[0]} onChange={s('protection_degree')} options={PROTECTION_DEGREES} />
        <Field label="Место установки" value={scheme.installation_location ?? ''} onChange={s('installation_location')} wide />
        <Field label="Количество фаз питания" value={String(scheme.phases_count ?? 3)} onChange={s('phases_count')} options={PHASES_OPTIONS} />
        <Field label="Тип питающей сети" value={scheme.network_type ?? NETWORK_TYPES[1]} onChange={s('network_type')} options={NETWORK_TYPES} />
        <Field label="Электропитание от РУ" value={scheme.power_supply_from ?? ''} onChange={s('power_supply_from')} placeholder="Источник питания" wide />
        <Field label="Кол-во модулей 17,5 мм" value={scheme.modules_count != null ? String(scheme.modules_count) : ''} onChange={s('modules_count')} />
      </div>

      {/* CENTER — Аппарат ввода */}
      <div style={{ borderRight: '1px solid var(--border)' }}>
        <div style={blockHeader}>Аппарат до ввода в распределительное устройство</div>
        <Field label="Тип аппарата" value={scheme.input_device_type ?? ''} onChange={s('input_device_type')} options={DEVICE_TYPES} wide />
        <Field label="Номинальный ток, А" value={scheme.nominal_current != null ? String(scheme.nominal_current) : ''} onChange={s('nominal_current')} />
        <Field label="Уставка расцепителя, А" value={scheme.trip_setting != null ? String(scheme.trip_setting) : ''} onChange={s('trip_setting')} />
        <Field label="Предельная коммутационная стойкость, кА" value={scheme.switching_capacity != null ? String(scheme.switching_capacity) : ''} onChange={s('switching_capacity')} />
        <Field label="Тип защитной характеристики" value={scheme.protection_characteristic ?? CURVES[2]} onChange={s('protection_characteristic')} options={CURVES} />
        <Field label="Количество отключаемых полюсов" value={scheme.poles_count != null ? String(scheme.poles_count) : '3'} onChange={s('poles_count')} options={POLES} />
        <Field label="Уставка дифференциального тока, мА" value={scheme.differential_current != null ? String(scheme.differential_current) : ''} onChange={s('differential_current')} placeholder="—" />
        <Field label="Обозначение" value={scheme.designation ?? ''} onChange={s('designation')} />
        <div style={{ ...fieldRow, minHeight: 40 }}>
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '8px 14px',
              fontSize: 11,
              color: 'var(--text-3)',
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            Информация о кабеле, которым запитано данное РУ, приведена в схеме РУ, осуществляющего
            электропитание
          </div>
        </div>
      </div>

      {/* RIGHT — Расчётные нагрузки */}
      <div>
        <div style={blockHeader}>Данные об итоговых значениях нагрузок</div>
        <Field label="Установленная полная мощность РУ, кВА" value={fmt(totals.installedPowerKva)} calculated />
        <Field label="Ток от установленной мощности, А" value={fmt(totals.installedCurrent)} calculated />
        <div style={{ height: 1, background: 'var(--border-light)' }} />
        <Field label="Расчётная полная мощность РУ, кВА" value={fmt(totals.calculatedPowerKva)} calculated />
        <Field label="Расчётный ток (экв. группа), А" value={fmt(totals.calculatedCurrent)} calculated />
        <Field
          label="Усреднённый коэффициент спроса"
          value={scheme.demand_coefficient != null ? String(scheme.demand_coefficient) : '1'}
          onChange={s('demand_coefficient')}
          placeholder="0.00–1.00"
        />
        <div style={{ height: 1, background: 'var(--border-light)' }} />
        <Field label="Iуст в фазе А, А" value={fmt(totals.phaseA)} calculated />
        <Field label="Iуст в фазе В, А" value={fmt(totals.phaseB)} calculated />
        <Field label="Iуст в фазе С, А" value={fmt(totals.phaseC)} calculated />
      </div>
    </div>
  )
}
