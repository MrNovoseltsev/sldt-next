'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
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
import { createDefaultData } from './defaults'
import {
  selectProjects,
  selectProject,
  insertProject,
  patchProject,
  removeProject,
  selectSchemesByProject,
  selectAllSchemesSummary,
  selectScheme,
  insertScheme,
  patchScheme,
  removeScheme,
  selectSchemeLines,
  insertSchemeLine,
  patchSchemeLine,
  removeSchemeLine,
  applySchemeLinesReorder,
  replaceSchemeLines,
} from './store'

type Result<T> = { data: T; error: string | null }
type DataResult<T> = { data: T | null; error: string | null }

export interface MockDataApi {
  // Selectors (read current snapshot synchronously)
  getProjects(): ProjectRow[]
  getProject(id: string): ProjectRow | null
  getSchemesByProject(projectId: string): SchemeRow[]
  getAllSchemesSummary(): SchemeSummary[]
  getScheme(id: string): SchemeRow | null
  getSchemeLines(schemeId: string): SchemeLineRow[]

  // Projects
  createProject(input: ProjectInsert): DataResult<ProjectRow>
  updateProject(id: string, patch: ProjectUpdate): DataResult<ProjectRow>
  deleteProject(id: string): { error: string | null }

  // Schemes
  createScheme(input: SchemeInsert): DataResult<SchemeRow>
  updateScheme(id: string, patch: SchemeUpdate): DataResult<SchemeRow>
  deleteScheme(id: string): { error: string | null }

  // Lines
  createSchemeLine(input: SchemeLineInsert): DataResult<SchemeLineRow>
  updateSchemeLine(id: string, patch: SchemeLineUpdate): DataResult<SchemeLineRow>
  deleteSchemeLine(id: string): { error: string | null }
  reorderSchemeLines(lines: { id: string; line_order: number }[]): { error: string | null }

  // Composite (parity with old server actions)
  saveSchemeHeader(id: string, patch: SchemeUpdate): { error: string | null }
  saveAllLines(
    schemeId: string,
    lines: Omit<SchemeLineRow, 'created_at' | 'updated_at'>[],
  ): { error: string | null }
}

interface MockDataContextValue extends MockDataApi {
  data: MockDb
}

const MockDataContext = createContext<MockDataContextValue | null>(null)

export function MockDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<MockDb>(() => createDefaultData())

  const getProjects = useCallback(() => selectProjects(data), [data])
  const getProject = useCallback((id: string) => selectProject(data, id), [data])
  const getSchemesByProject = useCallback(
    (projectId: string) => selectSchemesByProject(data, projectId),
    [data],
  )
  const getAllSchemesSummary = useCallback(() => selectAllSchemesSummary(data), [data])
  const getScheme = useCallback((id: string) => selectScheme(data, id), [data])
  const getSchemeLines = useCallback(
    (schemeId: string) => selectSchemeLines(data, schemeId),
    [data],
  )

  const createProject = useCallback((input: ProjectInsert): DataResult<ProjectRow> => {
    let row: ProjectRow | null = null
    setData((prev) => {
      const result = insertProject(prev, input)
      row = result.row
      return result.db
    })
    return { data: row, error: null }
  }, [])

  const updateProject = useCallback(
    (id: string, patch: ProjectUpdate): DataResult<ProjectRow> => {
      let row: ProjectRow | null = null
      setData((prev) => {
        const result = patchProject(prev, id, patch)
        row = result.row
        return result.db
      })
      return row ? { data: row, error: null } : { data: null, error: 'Объект не найден' }
    },
    [],
  )

  const deleteProject = useCallback((id: string) => {
    setData((prev) => removeProject(prev, id))
    return { error: null }
  }, [])

  const createScheme = useCallback((input: SchemeInsert): DataResult<SchemeRow> => {
    let row: SchemeRow | null = null
    setData((prev) => {
      const result = insertScheme(prev, input)
      row = result.row
      return result.db
    })
    return { data: row, error: null }
  }, [])

  const updateScheme = useCallback(
    (id: string, patch: SchemeUpdate): DataResult<SchemeRow> => {
      let row: SchemeRow | null = null
      setData((prev) => {
        const result = patchScheme(prev, id, patch)
        row = result.row
        return result.db
      })
      return row ? { data: row, error: null } : { data: null, error: 'Схема не найдена' }
    },
    [],
  )

  const deleteScheme = useCallback((id: string) => {
    setData((prev) => removeScheme(prev, id))
    return { error: null }
  }, [])

  const createSchemeLine = useCallback(
    (input: SchemeLineInsert): DataResult<SchemeLineRow> => {
      let row: SchemeLineRow | null = null
      setData((prev) => {
        const result = insertSchemeLine(prev, input)
        row = result.row
        return result.db
      })
      return { data: row, error: null }
    },
    [],
  )

  const updateSchemeLine = useCallback(
    (id: string, patch: SchemeLineUpdate): DataResult<SchemeLineRow> => {
      let row: SchemeLineRow | null = null
      setData((prev) => {
        const result = patchSchemeLine(prev, id, patch)
        row = result.row
        return result.db
      })
      return row ? { data: row, error: null } : { data: null, error: 'Линия не найдена' }
    },
    [],
  )

  const deleteSchemeLine = useCallback((id: string) => {
    setData((prev) => removeSchemeLine(prev, id))
    return { error: null }
  }, [])

  const reorderSchemeLines = useCallback(
    (lines: { id: string; line_order: number }[]) => {
      setData((prev) => applySchemeLinesReorder(prev, lines))
      return { error: null }
    },
    [],
  )

  const saveSchemeHeader = useCallback(
    (id: string, patch: SchemeUpdate) => {
      const { error } = updateScheme(id, patch)
      return { error }
    },
    [updateScheme],
  )

  const saveAllLines = useCallback(
    (
      schemeId: string,
      lines: Omit<SchemeLineRow, 'created_at' | 'updated_at'>[],
    ) => {
      setData((prev) => replaceSchemeLines(prev, schemeId, lines))
      return { error: null }
    },
    [],
  )

  const value = useMemo<MockDataContextValue>(
    () => ({
      data,
      getProjects,
      getProject,
      getSchemesByProject,
      getAllSchemesSummary,
      getScheme,
      getSchemeLines,
      createProject,
      updateProject,
      deleteProject,
      createScheme,
      updateScheme,
      deleteScheme,
      createSchemeLine,
      updateSchemeLine,
      deleteSchemeLine,
      reorderSchemeLines,
      saveSchemeHeader,
      saveAllLines,
    }),
    [
      data,
      getProjects,
      getProject,
      getSchemesByProject,
      getAllSchemesSummary,
      getScheme,
      getSchemeLines,
      createProject,
      updateProject,
      deleteProject,
      createScheme,
      updateScheme,
      deleteScheme,
      createSchemeLine,
      updateSchemeLine,
      deleteSchemeLine,
      reorderSchemeLines,
      saveSchemeHeader,
      saveAllLines,
    ],
  )

  return <MockDataContext.Provider value={value}>{children}</MockDataContext.Provider>
}

export function useMockData(): MockDataContextValue {
  const ctx = useContext(MockDataContext)
  if (!ctx) throw new Error('useMockData must be used within MockDataProvider')
  return ctx
}

export type { Result, DataResult }
