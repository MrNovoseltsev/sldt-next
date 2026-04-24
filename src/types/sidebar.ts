import type { ProjectRow } from './database'

export type SidebarScheme = {
  id: string
  device_name: string | null
}

export type SidebarLocation = {
  name: string | null
  schemes: SidebarScheme[]
}

export type SidebarProject = ProjectRow & {
  locations: SidebarLocation[]
}
