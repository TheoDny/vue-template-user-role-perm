import type { Permission } from "@/types/permission.type"

export type PermissionRequirement = Permission

export type SidebarItem = {
    label: string
    route: string
    permission: PermissionRequirement
}

export type SidebarCategory = {
    label: string
    items: SidebarItem[]
}
