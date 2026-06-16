export type PermissionResource = "organization" | "member" | "invitation" | "ac" | string

export type PermissionAction = "create" | "read" | "update" | "delete" | "cancel" | string

export type Permission = `${string}:${string}`

export type PermissionMatrix = Record<string, string[]>

export type ApiPermission = {
  resource: string
  action: string
  permission: Permission
}

export type PermissionCatalog = {
  permissions: ApiPermission[]
  resources: Record<string, readonly string[]>
}

export type PermissionCheckResult = {
  permission: Permission
  granted: boolean
}

export type CheckPermissionsResponse = {
  authorized: boolean
  permissions: PermissionCheckResult[]
  missingPermissions: Permission[]
}

