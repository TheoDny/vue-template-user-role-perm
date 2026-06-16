import { computed, ref } from "vue"
import { toast } from "vue-sonner"
import { isApiError } from "@/services/api.service"
import { createRole, deleteRole, listRoles, updateRoleName, updateRolePermissions } from "@/services/organization-role.service"
import { listPermissions } from "@/services/permission.service"
import type { OrganizationRole } from "@/types/organization-role.type"
import type { PermissionCatalog, PermissionMatrix } from "@/types/permission.type"

const staticRoleNames = new Set(["owner", "admin", "member"])

function normalizePermissions(role: OrganizationRole): PermissionMatrix {
  return role.permissions ?? role.permission ?? {}
}

function clonePermissions(permissions: PermissionMatrix): PermissionMatrix {
  return Object.fromEntries(
    Object.entries(permissions).map(([resource, actions]) => [resource, [...new Set(actions)]]),
  )
}

export function getRoleLabel(role: OrganizationRole): string {
  return role.name ?? role.role
}

export function getRoleKey(role: OrganizationRole): string {
  return role.id || role.role
}

export function isStaticRole(role: OrganizationRole): boolean {
  return staticRoleNames.has(role.role)
}

export function useRolesAdministration() {
  const roles = ref<OrganizationRole[]>([])
  const permissionCatalog = ref<PermissionCatalog | null>(null)
  const selectedRoleKey = ref<string | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  const selectedRole = computed(
    () => roles.value.find((role) => getRoleKey(role) === selectedRoleKey.value) ?? roles.value[0] ?? null,
  )

  const selectedPermissions = computed(() =>
    selectedRole.value ? clonePermissions(normalizePermissions(selectedRole.value)) : {},
  )

  async function refresh() {
    loading.value = true

    try {
      const [nextRoles, nextPermissions] = await Promise.all([listRoles(), listPermissions()])
      roles.value = Array.isArray(nextRoles) ? nextRoles : []
      permissionCatalog.value = nextPermissions

      if (!selectedRoleKey.value || !roles.value.some((role) => getRoleKey(role) === selectedRoleKey.value)) {
        selectedRoleKey.value = roles.value[0] ? getRoleKey(roles.value[0]) : null
      }
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Unable to load roles")
    } finally {
      loading.value = false
    }
  }

  async function create(payload: { role: string; permissions: PermissionMatrix }) {
    saving.value = true

    try {
      await createRole(payload)
      await refresh()
      selectedRoleKey.value = payload.role
      toast.success("Role created")
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Unable to create role")
      throw error
    } finally {
      saving.value = false
    }
  }

  async function rename(role: OrganizationRole, name: string) {
    saving.value = true

    try {
      await updateRoleName(getRoleKey(role), { name })
      await refresh()
      toast.success("Role renamed")
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Unable to rename role")
      throw error
    } finally {
      saving.value = false
    }
  }

  async function updatePermissions(role: OrganizationRole, permissions: PermissionMatrix) {
    saving.value = true

    try {
      await updateRolePermissions(getRoleKey(role), { permissions })
      await refresh()
      toast.success("Role permissions updated")
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Unable to update role permissions")
      throw error
    } finally {
      saving.value = false
    }
  }

  async function remove(role: OrganizationRole) {
    saving.value = true

    try {
      await deleteRole(getRoleKey(role))
      await refresh()
      toast.success("Role deleted")
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Unable to delete role")
      throw error
    } finally {
      saving.value = false
    }
  }

  return {
    roles,
    permissionCatalog,
    selectedRoleKey,
    selectedRole,
    selectedPermissions,
    loading,
    saving,
    refresh,
    create,
    rename,
    updatePermissions,
    remove,
  }
}

