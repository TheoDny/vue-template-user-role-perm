import { apiRequest } from "@/services/api.service"
import type {
    CreateRoleRequest,
    OrganizationRole,
    UpdateRoleNameRequest,
    UpdateRolePermissionsRequest,
} from "@/types/organization-role.type"

export function listRoles() {
    return apiRequest<OrganizationRole[]>("/roles")
}

export function createRole(payload: CreateRoleRequest) {
    return apiRequest<OrganizationRole>("/roles", {
        method: "POST",
        body: payload,
    })
}

export function updateRoleName(roleId: string, payload: UpdateRoleNameRequest) {
    return apiRequest<OrganizationRole>(`/roles/${roleId}`, {
        method: "PATCH",
        body: payload,
    })
}

export function updateRolePermissions(roleId: string, payload: UpdateRolePermissionsRequest) {
    return apiRequest<OrganizationRole>(`/roles/${roleId}/permissions`, {
        method: "PATCH",
        body: payload,
    })
}

export function deleteRole(roleId: string) {
    return apiRequest<{ success: boolean }>(`/roles/${roleId}`, {
        method: "DELETE",
    })
}
