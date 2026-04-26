import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer'
import type { SchemeRow, SchemeLineRow, ProjectRow } from '@/types/database'
import type { SchemeTotals } from '@/lib/calculations/electrical'

Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuaabWmT.ttf', fontWeight: 300 },
    { src: 'https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWubEbWmT.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/roboto/v51/KFOMCnqEu92Fr1ME7kSn66aGLdTylUAMQXC89YmC2DPNWuYjammT.ttf', fontWeight: 700 },
  ],
})

const C = {
  bg: '#f9f9f8',
  surface: '#ffffff',
  border: '#e5e4e0',
  borderLight: '#f0eeea',
  text1: '#181816',
  text2: '#6a6a65',
  text3: '#a8a8a2',
  accent: '#3d6b8f',
  accentBg: '#eff4f8',
  rowAlt: '#f7f7f6',
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontWeight: 400,
    fontSize: 7,
    color: C.text1,
    backgroundColor: C.surface,
    padding: '12mm 12mm 10mm 12mm',
    flexDirection: 'column',
  },

  // Page header
  pageHeader: {
    borderBottom: `1pt solid ${C.border}`,
    paddingBottom: 5,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  pageTitle: { fontSize: 9, fontWeight: 700, color: C.text1 },
  pageSubtitle: { fontSize: 6.5, color: C.text2, marginTop: 2 },
  pageGost: { fontSize: 6.5, color: C.text3 },

  // Three blocks
  threeBlocks: {
    flexDirection: 'row',
    border: `1pt solid ${C.border}`,
    marginBottom: 0,
  },
  block: { flex: 1, flexDirection: 'column' },
  blockMiddle: { flex: 1, flexDirection: 'column', borderLeft: `1pt solid ${C.border}`, borderRight: `1pt solid ${C.border}` },
  blockHeader: {
    backgroundColor: C.bg,
    borderBottom: `1pt solid ${C.border}`,
    padding: '4pt 6pt',
    fontSize: 6,
    fontWeight: 700,
    color: C.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldRow: {
    flexDirection: 'row',
    borderBottom: `0.5pt solid ${C.borderLight}`,
    minHeight: 14,
    alignItems: 'stretch',
  },
  fieldLabel: {
    flex: 1,
    fontSize: 6.5,
    color: C.text2,
    padding: '3pt 4pt 3pt 6pt',
    lineHeight: 1.3,
  },
  fieldValue: {
    minWidth: 55,
    fontSize: 6.5,
    color: C.text1,
    padding: '3pt 6pt 3pt 4pt',
    borderLeft: `0.5pt solid ${C.borderLight}`,
    lineHeight: 1.3,
  },
  fieldValueCalc: {
    minWidth: 55,
    fontSize: 6.5,
    color: C.accent,
    fontWeight: 700,
    padding: '3pt 6pt 3pt 4pt',
    borderLeft: `0.5pt solid ${C.borderLight}`,
    backgroundColor: C.accentBg,
    lineHeight: 1.3,
  },

  // Lines table
  linesSection: {
    border: `1pt solid ${C.border}`,
    borderTop: 'none',
    flexDirection: 'column',
  },
  linesSectionHeader: {
    backgroundColor: C.bg,
    borderBottom: `1pt solid ${C.border}`,
    padding: '4pt 8pt',
    flexDirection: 'row',
    alignItems: 'center',
  },
  linesSectionTitle: {
    fontSize: 6,
    fontWeight: 700,
    color: C.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  linesSectionCount: { fontSize: 6, color: C.text3 },

  // Table
  tableHead: {
    flexDirection: 'row',
    backgroundColor: C.bg,
    borderBottom: `0.5pt solid ${C.border}`,
  },
  tableHeadGroup: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRight: `0.5pt solid ${C.borderLight}`,
  },
  thGroup: {
    fontSize: 5.5,
    fontWeight: 700,
    color: C.text2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
    padding: '2pt 2pt 1pt',
  },
  thSub: {
    fontSize: 5.5,
    color: C.text3,
    textAlign: 'center',
    padding: '1pt 2pt 2pt',
  },
  tableRow: { flexDirection: 'row', borderBottom: `0.5pt solid ${C.borderLight}` },
  tableRowAlt: { flexDirection: 'row', borderBottom: `0.5pt solid ${C.borderLight}`, backgroundColor: C.rowAlt },
  td: {
    fontSize: 6.5,
    color: C.text1,
    padding: '2.5pt 3pt',
    borderRight: `0.5pt solid ${C.borderLight}`,
    lineHeight: 1.2,
  },
  tdNum: {
    fontSize: 6.5,
    color: C.text2,
    padding: '2.5pt 3pt',
    borderRight: `0.5pt solid ${C.borderLight}`,
    textAlign: 'right',
    lineHeight: 1.2,
  },
  tdIdx: {
    fontSize: 6,
    color: C.text3,
    padding: '2.5pt 3pt',
    borderRight: `0.5pt solid ${C.borderLight}`,
    textAlign: 'center',
    lineHeight: 1.2,
    backgroundColor: C.bg,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 4,
    borderTop: `0.5pt solid ${C.borderLight}`,
  },
  footerText: { fontSize: 6, color: C.text3 },
})

// Column widths in pt (A4 landscape body ≈ 745pt after 12mm margins each side)
const COL = {
  idx:  18,
  apDes: 26, apType: 70, apInom: 22, apIset: 22, apCurve: 18, apIdiff: 22,
  cblDes: 22, cblMark: 50, cblLen: 20,
  pipeDes: 36, pipeLen: 20,
  power: 28,
  phA: 22, phB: 22, phC: 22,
  cosf: 22,
  loadName: 0, // flex: 1
  del: 0,
}

function val(v: string | number | null | undefined, fallback = '—'): string {
  if (v == null || v === '') return fallback
  return String(v)
}

function fmt(v: number | null | undefined, dec = 1): string {
  if (v == null) return '—'
  return v.toFixed(dec)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

interface FieldRowProps {
  label: string
  value: string
  calculated?: boolean
}
function FR({ label, value, calculated }: FieldRowProps) {
  return (
    <View style={s.fieldRow}>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={calculated ? s.fieldValueCalc : s.fieldValue}>{value}</Text>
    </View>
  )
}

interface SchemePdfProps {
  scheme: SchemeRow
  lines: SchemeLineRow[]
  project: ProjectRow
  totals: SchemeTotals
}

export default function SchemePdf({ scheme, lines, project, totals }: SchemePdfProps) {
  const schemeName = scheme.device_name ?? 'Без названия'
  const today = formatDate(new Date().toISOString())

  return (
    <Document
      title={`${schemeName} — ГОСТ 21.613-2014`}
      author="SLDt"
      subject="Принципиальная схема групповой сети"
    >
      <Page size="A4" orientation="landscape" style={s.page}>
        {/* Page header */}
        <View style={s.pageHeader}>
          <View>
            <Text style={s.pageTitle}>{schemeName} — Принципиальная схема групповой сети</Text>
            <Text style={s.pageSubtitle}>
              {project.name}
              {scheme.installation_location ? ` · ${scheme.installation_location}` : ''}
            </Text>
          </View>
          <Text style={s.pageGost}>ГОСТ 21.613-2014</Text>
        </View>

        {/* Three-column header form */}
        <View style={s.threeBlocks}>
          {/* LEFT — РУ */}
          <View style={s.block}>
            <Text style={s.blockHeader}>Распределительное устройство</Text>
            <FR label="Наименование РУ" value={val(scheme.device_name)} />
            <FR label="Марка оболочки" value={val(scheme.shell_brand)} />
            <FR label="Код оболочки" value={val(scheme.shell_code)} />
            <FR label="Способ монтажа" value={val(scheme.installation_method)} />
            <FR label="Степень защиты" value={val(scheme.protection_degree)} />
            <FR label="Место установки" value={val(scheme.installation_location)} />
            <FR label="Количество фаз" value={val(scheme.phases_count)} />
            <FR label="Тип питающей сети" value={val(scheme.network_type)} />
            <FR label="Электропитание от РУ" value={val(scheme.power_supply_from)} />
            <FR label="Модулей 17,5 мм" value={val(scheme.modules_count)} />
          </View>

          {/* CENTER — Аппарат ввода */}
          <View style={s.blockMiddle}>
            <Text style={s.blockHeader}>Аппарат до ввода в РУ</Text>
            <FR label="Тип аппарата" value={val(scheme.input_device_type)} />
            <FR label="Номинальный ток, А" value={val(scheme.nominal_current)} />
            <FR label="Уставка расцепителя, А" value={val(scheme.trip_setting)} />
            <FR label="Коммутационная стойкость, кА" value={val(scheme.switching_capacity)} />
            <FR label="Защитная характеристика" value={val(scheme.protection_characteristic)} />
            <FR label="Кол-во полюсов" value={val(scheme.poles_count)} />
            <FR label="Уставка диф. тока, мА" value={val(scheme.differential_current)} />
            <FR label="Обозначение" value={val(scheme.designation)} />
          </View>

          {/* RIGHT — Нагрузки */}
          <View style={s.block}>
            <Text style={s.blockHeader}>Итоговые нагрузки</Text>
            <FR label="Sуст, кВА" value={fmt(totals.installedPowerKva)} calculated />
            <FR label="Iуст, А" value={fmt(totals.installedCurrent)} calculated />
            <FR label="Sрасч, кВА" value={fmt(totals.calculatedPowerKva)} calculated />
            <FR label="Iрасч, А" value={fmt(totals.calculatedCurrent)} calculated />
            <FR label="Ксп" value={val(scheme.demand_coefficient, '1')} />
            <FR label="Iф А, А" value={fmt(totals.phaseA)} calculated />
            <FR label="Iф В, А" value={fmt(totals.phaseB)} calculated />
            <FR label="Iф С, А" value={fmt(totals.phaseC)} calculated />
          </View>
        </View>

        {/* Lines table */}
        <View style={s.linesSection}>
          <View style={s.linesSectionHeader}>
            <Text style={s.linesSectionTitle}>Линии и электроприёмники</Text>
            <Text style={s.linesSectionCount}>{lines.length} записей</Text>
          </View>

          {/* Table header */}
          <View style={s.tableHead}>
            {/* № */}
            <Text style={[s.thGroup, { width: COL.idx, borderRight: `0.5pt solid ${C.borderLight}` }]}>№</Text>
            {/* Аппарат */}
            <View style={[s.tableHeadGroup, { width: COL.apDes + COL.apType + COL.apInom + COL.apIset + COL.apCurve + COL.apIdiff }]}>
              <Text style={s.thGroup}>Аппарат отходящей линии</Text>
              <View style={{ flexDirection: 'row' }}>
                {['Обозн.', 'Тип', 'Iн,А', 'Iу,А', 'Хар', 'Iдиф'].map((h, i) => (
                  <Text key={i} style={[s.thSub, { width: [COL.apDes, COL.apType, COL.apInom, COL.apIset, COL.apCurve, COL.apIdiff][i], borderRight: `0.5pt solid ${C.borderLight}` }]}>{h}</Text>
                ))}
              </View>
            </View>
            {/* Кабель */}
            <View style={[s.tableHeadGroup, { width: COL.cblDes + COL.cblMark + COL.cblLen }]}>
              <Text style={s.thGroup}>Кабель, провод</Text>
              <View style={{ flexDirection: 'row' }}>
                {['Обозн.', 'Марка', 'Дл,м'].map((h, i) => (
                  <Text key={i} style={[s.thSub, { width: [COL.cblDes, COL.cblMark, COL.cblLen][i], borderRight: `0.5pt solid ${C.borderLight}` }]}>{h}</Text>
                ))}
              </View>
            </View>
            {/* Труба */}
            <View style={[s.tableHeadGroup, { width: COL.pipeDes + COL.pipeLen }]}>
              <Text style={s.thGroup}>Труба</Text>
              <View style={{ flexDirection: 'row' }}>
                {['Обозн.', 'Дл,м'].map((h, i) => (
                  <Text key={i} style={[s.thSub, { width: [COL.pipeDes, COL.pipeLen][i], borderRight: `0.5pt solid ${C.borderLight}` }]}>{h}</Text>
                ))}
              </View>
            </View>
            {/* P */}
            <Text style={[s.thGroup, { width: COL.power, borderRight: `0.5pt solid ${C.borderLight}`, alignSelf: 'center' }]}>P,кВт</Text>
            {/* Токи */}
            <View style={[s.tableHeadGroup, { width: COL.phA + COL.phB + COL.phC }]}>
              <Text style={s.thGroup}>Iном по фазам, А</Text>
              <View style={{ flexDirection: 'row' }}>
                {['А', 'В', 'С'].map((h, i) => (
                  <Text key={i} style={[s.thSub, { width: [COL.phA, COL.phB, COL.phC][i], borderRight: `0.5pt solid ${C.borderLight}` }]}>{h}</Text>
                ))}
              </View>
            </View>
            {/* cosφ */}
            <Text style={[s.thGroup, { width: COL.cosf, borderRight: `0.5pt solid ${C.borderLight}`, alignSelf: 'center' }]}>cos φ</Text>
            {/* Нагрузка */}
            <Text style={[s.thGroup, { flex: 1, alignSelf: 'center' }]}>Электроприёмник</Text>
          </View>

          {/* Table rows */}
          {lines.length === 0 ? (
            <View style={{ padding: '10pt 8pt' }}>
              <Text style={{ fontSize: 7, color: C.text3, textAlign: 'center' }}>Линии не добавлены</Text>
            </View>
          ) : (
            lines.map((line, idx) => (
              <View key={line.id} style={idx % 2 === 0 ? s.tableRow : s.tableRowAlt} wrap={false}>
                <Text style={[s.tdIdx, { width: COL.idx }]}>{idx + 1}</Text>
                <Text style={[s.td, { width: COL.apDes }]}>{val(line.circuit_breaker_designation)}</Text>
                <Text style={[s.td, { width: COL.apType }]}>{val(line.circuit_breaker_type)}</Text>
                <Text style={[s.tdNum, { width: COL.apInom }]}>{val(line.cb_nominal_current)}</Text>
                <Text style={[s.tdNum, { width: COL.apIset }]}>{val(line.cb_trip_setting)}</Text>
                <Text style={[s.td, { width: COL.apCurve, textAlign: 'center' }]}>{val(line.cb_protection_type)}</Text>
                <Text style={[s.tdNum, { width: COL.apIdiff }]}>{val(line.cb_differential_current)}</Text>
                <Text style={[s.td, { width: COL.cblDes }]}>{val(line.cable_designation)}</Text>
                <Text style={[s.td, { width: COL.cblMark }]}>{val(line.cable_brand)}</Text>
                <Text style={[s.tdNum, { width: COL.cblLen }]}>{val(line.cable_length)}</Text>
                <Text style={[s.td, { width: COL.pipeDes }]}>{val(line.pipe_designation)}</Text>
                <Text style={[s.tdNum, { width: COL.pipeLen }]}>{val(line.pipe_length)}</Text>
                <Text style={[s.tdNum, { width: COL.power }]}>{val(line.power_kw)}</Text>
                <Text style={[s.tdNum, { width: COL.phA }]}>{val(line.phase_a_current)}</Text>
                <Text style={[s.tdNum, { width: COL.phB }]}>{val(line.phase_b_current)}</Text>
                <Text style={[s.tdNum, { width: COL.phC }]}>{val(line.phase_c_current)}</Text>
                <Text style={[s.tdNum, { width: COL.cosf }]}>{val(line.cos_phi)}</Text>
                <Text style={[s.td, { flex: 1 }]}>{val(line.load_name)}{line.load_type ? ` (${line.load_type})` : ''}</Text>
              </View>
            ))
          )}
        </View>

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>Генерировано: {today} · SLDt</Text>
          <Text style={s.footerText}>ГОСТ 21.613-2014</Text>
        </View>
      </Page>
    </Document>
  )
}
