import type { Permission } from "@/types/permission.type"

export type AdminNavigationItem = {
    label: string
    route: string
    routeName: string
    permission: Permission
}

export const administrationItems: AdminNavigationItem[] = [
    {
        label: "Roles",
        route: "/admin/roles",
        routeName: "admin-roles",
        permission: "ac:read",
    },
    {
        label: "Members",
        route: "/admin/members",
        routeName: "admin-members",
        permission: "member:read",
    },
    {
        label: "Invitations",
        route: "/admin/invitations",
        routeName: "admin-invitations",
        permission: "invitation:read",
    },
]

export function getVisibleAdministrationItems(hasPermission: (permission: Permission) => boolean) {
    return administrationItems.filter((item) => hasPermission(item.permission))
}

export function getFirstAllowedAdministrationRouteName(hasPermission: (permission: Permission) => boolean) {
    return getVisibleAdministrationItems(hasPermission)[0]?.routeName ?? "access-denied"
}
