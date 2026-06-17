import { apiRequest } from "@/services/api.service"
import type { CheckPermissionsResponse, Permission, PermissionCatalog } from "@/types/permission.type"

export function listPermissions() {
    return apiRequest<PermissionCatalog>("/permissions")
}

export function checkPermissions(permissions: Permission[]) {
    return apiRequest<CheckPermissionsResponse>("/permissions/check", {
        method: "POST",
        body: { permissions },
    })
}
