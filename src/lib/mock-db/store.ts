import type {
  MockDb,
  ProjectRow,
  ProjectInsert,
  ProjectUpdate,
  SchemeRow,
  SchemeInsert,
  SchemeUpdate,
  SchemeLineRow,
  SchemeLineInsert,
  SchemeLineUpdate,
  SchemeSummary,
} from './types'

const now = () => new Date().toISOString()
const newId = () => crypto.randomUUID()

// ── Projects ──────────────────────────────────────────────────────────────────

export function selectProjects(db: MockDb): ProjectRow[] {
  return [...db.projects].sort((a, b) => b.updated_at.localeCompare(a.updated_at))
}

export function selectProject(db: MockDb, id: string): ProjectRow | null {
  return db.projects.find((p) => p.id === id) ?? null
}

export function insertProject(
  db: MockDb,
  data: ProjectInsert,
): { db: MockDb; row: ProjectRow } {
  const ts = now()
  const row: ProjectRow = {
    id: data.id ?? newId(),
    name: data.name,
    customer: data.customer ?? null,
    user_id: data.user_id,
    created_at: data.created_at ?? ts,
    updated_at: data.updated_at ?? ts,
  }
  return { db: { ...db, projects: [...db.projects, row] }, row }
}

export function patchProject(
  db: MockDb,
  id: string,
  patch: ProjectUpdate,
): { db: MockDb; row: ProjectRow | null } {
  let updated: ProjectRow | null = null
  const projects = db.projects.map((p) => {
    if (p.id !== id) return p
    updated = { ...p, ...patch, updated_at: now() }
    return updated
  })
  return { db: { ...db, projects }, row: updated }
}

export function removeProject(db: MockDb, id: string): MockDb {
  const removedSchemeIds = new Set(
    db.schemes.filter((s) => s.project_id === id).map((s) => s.id),
  )
  return {
    projects: db.projects.filter((p) => p.id !== id),
    schemes: db.schemes.filter((s) => s.project_id !== id),
    schemeLines: db.schemeLines.filter((l) => !removedSchemeIds.has(l.scheme_id)),
  }
}

// ── Schemes ───────────────────────────────────────────────────────────────────

export function selectSchemesByProject(db: MockDb, projectId: string): SchemeRow[] {
  return db.schemes
    .filter((s) => s.project_id === projectId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
}

export function selectAllSchemesSummary(db: MockDb): SchemeSummary[] {
  return [...db.schemes]
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((s) => ({
      id: s.id,
      project_id: s.project_id,
      device_name: s.device_name,
      installation_location: s.installation_location,
    }))
}

export function selectScheme(db: MockDb, id: string): SchemeRow | null {
  return db.schemes.find((s) => s.id === id) ?? null
}

export function insertScheme(
  db: MockDb,
  data: SchemeInsert,
): { db: MockDb; row: SchemeRow } {
  const ts = now()
  const row: SchemeRow = {
    id: data.id ?? newId(),
    project_id: data.project_id,
    device_name: data.device_name ?? null,
    shell_brand: data.shell_brand ?? null,
    shell_code: data.shell_code ?? null,
    installation_method: data.installation_method ?? null,
    protection_degree: data.protection_degree ?? null,
    installation_location: data.installation_location ?? null,
    phases_count: data.phases_count ?? null,
    network_type: data.network_type ?? null,
    power_supply_from: data.power_supply_from ?? null,
    modules_count: data.modules_count ?? null,
    input_device_type: data.input_device_type ?? null,
    nominal_current: data.nominal_current ?? null,
    trip_setting: data.trip_setting ?? null,
    switching_capacity: data.switching_capacity ?? null,
    protection_characteristic: data.protection_characteristic ?? null,
    poles_count: data.poles_count ?? null,
    differential_current: data.differential_current ?? null,
    designation: data.designation ?? null,
    cable_info: data.cable_info ?? null,
    installed_power_kva: data.installed_power_kva ?? null,
    installed_power_current: data.installed_power_current ?? null,
    calculated_power_kva: data.calculated_power_kva ?? null,
    calculated_current: data.calculated_current ?? null,
    demand_coefficient: data.demand_coefficient ?? null,
    current_phase_a: data.current_phase_a ?? null,
    current_phase_b: data.current_phase_b ?? null,
    current_phase_c: data.current_phase_c ?? null,
    created_at: data.created_at ?? ts,
    updated_at: data.updated_at ?? ts,
  }
  // bump parent project's updated_at
  const projects = db.projects.map((p) =>
    p.id === row.project_id ? { ...p, updated_at: ts } : p,
  )
  return { db: { ...db, projects, schemes: [...db.schemes, row] }, row }
}

export function patchScheme(
  db: MockDb,
  id: string,
  patch: SchemeUpdate,
): { db: MockDb; row: SchemeRow | null } {
  const ts = now()
  let updated: SchemeRow | null = null
  const schemes = db.schemes.map((s) => {
    if (s.id !== id) return s
    updated = { ...s, ...patch, updated_at: ts }
    return updated
  })
  if (!updated) return { db, row: null }
  const target = updated as SchemeRow
  const projects = db.projects.map((p) =>
    p.id === target.project_id ? { ...p, updated_at: ts } : p,
  )
  return { db: { ...db, projects, schemes }, row: updated }
}

export function removeScheme(db: MockDb, id: string): MockDb {
  return {
    ...db,
    schemes: db.schemes.filter((s) => s.id !== id),
    schemeLines: db.schemeLines.filter((l) => l.scheme_id !== id),
  }
}

// ── Scheme lines ──────────────────────────────────────────────────────────────

export function selectSchemeLines(db: MockDb, schemeId: string): SchemeLineRow[] {
  return db.schemeLines
    .filter((l) => l.scheme_id === schemeId)
    .sort((a, b) => a.line_order - b.line_order)
}

export function insertSchemeLine(
  db: MockDb,
  data: SchemeLineInsert,
): { db: MockDb; row: SchemeLineRow } {
  const ts = now()
  const row: SchemeLineRow = {
    id: data.id ?? newId(),
    scheme_id: data.scheme_id,
    line_order: data.line_order,
    circuit_breaker_designation: data.circuit_breaker_designation ?? null,
    circuit_breaker_type: data.circuit_breaker_type ?? null,
    cb_nominal_current: data.cb_nominal_current ?? null,
    cb_trip_setting: data.cb_trip_setting ?? null,
    cb_protection_type: data.cb_protection_type ?? null,
    cb_differential_current: data.cb_differential_current ?? null,
    cable_designation: data.cable_designation ?? null,
    cable_brand: data.cable_brand ?? null,
    cable_length: data.cable_length ?? null,
    pipe_designation: data.pipe_designation ?? null,
    pipe_length: data.pipe_length ?? null,
    pipe_marking: data.pipe_marking ?? null,
    power_kw: data.power_kw ?? null,
    phase_a_current: data.phase_a_current ?? null,
    phase_b_current: data.phase_b_current ?? null,
    phase_c_current: data.phase_c_current ?? null,
    cos_phi: data.cos_phi ?? null,
    load_name: data.load_name ?? null,
    load_type: data.load_type ?? null,
    load_drawing: data.load_drawing ?? null,
    created_at: data.created_at ?? ts,
    updated_at: data.updated_at ?? ts,
  }
  return { db: { ...db, schemeLines: [...db.schemeLines, row] }, row }
}

export function patchSchemeLine(
  db: MockDb,
  id: string,
  patch: SchemeLineUpdate,
): { db: MockDb; row: SchemeLineRow | null } {
  let updated: SchemeLineRow | null = null
  const schemeLines = db.schemeLines.map((l) => {
    if (l.id !== id) return l
    updated = { ...l, ...patch, updated_at: now() }
    return updated
  })
  return { db: { ...db, schemeLines }, row: updated }
}

export function removeSchemeLine(db: MockDb, id: string): MockDb {
  return { ...db, schemeLines: db.schemeLines.filter((l) => l.id !== id) }
}

export function applySchemeLinesReorder(
  db: MockDb,
  lines: { id: string; line_order: number }[],
): MockDb {
  const orderMap = new Map(lines.map((l) => [l.id, l.line_order]))
  const schemeLines = db.schemeLines.map((l) =>
    orderMap.has(l.id) ? { ...l, line_order: orderMap.get(l.id)!, updated_at: now() } : l,
  )
  return { ...db, schemeLines }
}

// Composite: replace scheme lines entirely (mirrors saveAllLinesAction)
export function replaceSchemeLines(
  db: MockDb,
  schemeId: string,
  incoming: Omit<SchemeLineRow, 'created_at' | 'updated_at'>[],
): MockDb {
  const ts = now()
  const incomingIds = new Set(incoming.map((l) => l.id))
  const kept = db.schemeLines.filter(
    (l) => l.scheme_id !== schemeId || incomingIds.has(l.id),
  )
  const existingById = new Map(kept.map((l) => [l.id, l]))
  const next: SchemeLineRow[] = incoming.map((line) => {
    const sanitizedCosPhi =
      line.cos_phi !== null && (line.cos_phi < 0.01 || line.cos_phi > 1.0)
        ? null
        : line.cos_phi
    const existing = existingById.get(line.id)
    if (existing) {
      return { ...existing, ...line, cos_phi: sanitizedCosPhi, updated_at: ts }
    }
    return {
      ...line,
      cos_phi: sanitizedCosPhi,
      created_at: ts,
      updated_at: ts,
    }
  })
  // Preserve any lines from other schemes
  const otherSchemes = db.schemeLines.filter((l) => l.scheme_id !== schemeId)
  return { ...db, schemeLines: [...otherSchemes, ...next] }
}
