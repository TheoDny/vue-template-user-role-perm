import type { PermissionMatrix } from "@/types/permission.type"

export type OrganizationRole = {
  id: string
  role: string
  name?: string
  permission?: PermissionMatrix
  permissions?: PermissionMatrix
  createdAt?: string
  updatedAt?: string
}

export type CreateRoleRequest = {
  role: string
  permissions?: PermissionMatrix
}

export type UpdateRoleNameRequest = {
  name: string
}

export type UpdateRolePermissionsRequest = {
  permissions: PermissionMatrix
}

