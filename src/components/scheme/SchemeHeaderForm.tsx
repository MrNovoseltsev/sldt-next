import type { SchemeRow } from '@/types/database'
import type { SchemeTotals } from '@/lib/calculations/electrical'
import { cn } from '@/lib/utils'

interface FieldProps {
  label: string
  value: string
  onChange?: (v: string) => void
  options?: readonly string[]
  calculated?: boolean
  placeholder?: string
}

function Field({ label, value, onChange, options, calculated, placeholder }: FieldProps) {
  return (
    <div className="grid grid-cols-[1fr_120px] items-stretch border-b border-[var(--border-light)] min-h-[32px]">
      <div className="text-[11.5px] text-muted-foreground py-[7px] pr-[10px] pl-[14px] leading-[1.35] flex items-center">
        {label}
      </div>
      <div className={cn('border-l border-[var(--border-light)] flex items-stretch overflow-hidden', calculated && 'bg-[var(--bg)]')}>
        {options ? (
          <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="border-none outline-none bg-transparent w-full px-[10px] text-xs font-[inherit] cursor-pointer focus:bg-accent"
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
            className={cn(
              'border-none outline-none bg-transparent w-full px-[10px] text-xs font-[inherit] slashed-zero transition-colors',
              calculated
                ? 'text-[var(--accent)] font-medium cursor-default'
                : 'text-foreground focus:bg-accent',
            )}
          />
        )}
      </div>
    </div>
  )
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

  const blockHeader = 'px-[14px] pt-[10px] pb-[9px] border-b border-border text-[10px] font-semibold tracking-[.06em] uppercase text-muted-foreground leading-[1.4] bg-[var(--bg)]'

  return (
    <div className="grid grid-cols-3 border-b border-border bg-[var(--surface)]">
      {/* LEFT — РУ */}
      <div className="border-r border-border">
        <div className={blockHeader}>Данные распределительного устройства</div>
        <Field label="Распределительное устройство" value={scheme.device_name ?? ''} onChange={s('device_name')} />
        <Field label="Марка оболочки" value={scheme.shell_brand ?? ''} onChange={s('shell_brand')} />
        <Field label="Код оболочки" value={scheme.shell_code ?? ''} onChange={s('shell_code')} />
        <Field label="Способ монтажа" value={scheme.installation_method ?? INSTALLATION_METHODS[0]} onChange={s('installation_method')} options={INSTALLATION_METHODS} />
        <Field label="Степень защиты по ГОСТ 14.254-96" value={scheme.protection_degree ?? PROTECTION_DEGREES[0]} onChange={s('protection_degree')} options={PROTECTION_DEGREES} />
        <Field label="Место установки" value={scheme.installation_location ?? ''} onChange={s('installation_location')} />
        <Field label="Количество фаз питания" value={String(scheme.phases_count ?? 3)} onChange={s('phases_count')} options={PHASES_OPTIONS} />
        <Field label="Тип питающей сети" value={scheme.network_type ?? NETWORK_TYPES[1]} onChange={s('network_type')} options={NETWORK_TYPES} />
        <Field label="Электропитание от РУ" value={scheme.power_supply_from ?? ''} onChange={s('power_supply_from')} placeholder="Источник питания" />
        <Field label="Кол-во модулей 17,5 мм" value={scheme.modules_count != null ? String(scheme.modules_count) : ''} onChange={s('modules_count')} />
      </div>

      {/* CENTER — Аппарат ввода */}
      <div className="border-r border-border">
        <div className={blockHeader}>Аппарат до ввода в распределительное устройство</div>
        <Field label="Тип аппарата" value={scheme.input_device_type ?? ''} onChange={s('input_device_type')} options={DEVICE_TYPES} />
        <Field label="Номинальный ток, А" value={scheme.nominal_current != null ? String(scheme.nominal_current) : ''} onChange={s('nominal_current')} />
        <Field label="Уставка расцепителя, А" value={scheme.trip_setting != null ? String(scheme.trip_setting) : ''} onChange={s('trip_setting')} />
        <Field label="Предельная коммутационная стойкость, кА" value={scheme.switching_capacity != null ? String(scheme.switching_capacity) : ''} onChange={s('switching_capacity')} />
        <Field label="Тип защитной характеристики" value={scheme.protection_characteristic ?? CURVES[2]} onChange={s('protection_characteristic')} options={CURVES} />
        <Field label="Количество отключаемых полюсов" value={scheme.poles_count != null ? String(scheme.poles_count) : '3'} onChange={s('poles_count')} options={POLES} />
        <Field label="Уставка дифференциального тока, мА" value={scheme.differential_current != null ? String(scheme.differential_current) : ''} onChange={s('differential_current')} placeholder="—" />
        <Field label="Обозначение" value={scheme.designation ?? ''} onChange={s('designation')} />
        <div className="grid grid-cols-[1fr_120px] items-stretch border-b border-[var(--border-light)] min-h-[40px]">
          <div className="col-span-full px-[14px] py-[8px] text-[11px] text-[var(--text-3)] italic leading-[1.5]">
            Информация о кабеле, которым запитано данное РУ, приведена в схеме РУ, осуществляющего
            электропитание
          </div>
        </div>
      </div>

      {/* RIGHT — Расчётные нагрузки */}
      <div>
        <div className={blockHeader}>Данные об итоговых значениях нагрузок</div>
        <Field label="Установленная полная мощность РУ, кВА" value={fmt(totals.installedPowerKva)} calculated />
        <Field label="Ток от установленной мощности, А" value={fmt(totals.installedCurrent)} calculated />
        <div className="h-px bg-[var(--border-light)]" />
        <Field label="Расчётная полная мощность РУ, кВА" value={fmt(totals.calculatedPowerKva)} calculated />
        <Field label="Расчётный ток (экв. группа), А" value={fmt(totals.calculatedCurrent)} calculated />
        <Field
          label="Усреднённый коэффициент спроса"
          value={scheme.demand_coefficient != null ? String(scheme.demand_coefficient) : '1'}
          onChange={s('demand_coefficient')}
          placeholder="0.00–1.00"
        />
        <div className="h-px bg-[var(--border-light)]" />
        <Field label="Iуст в фазе А, А" value={fmt(totals.phaseA)} calculated />
        <Field label="Iуст в фазе В, А" value={fmt(totals.phaseB)} calculated />
        <Field label="Iуст в фазе С, А" value={fmt(totals.phaseC)} calculated />
      </div>
    </div>
  )
}
