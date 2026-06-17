import { defineStore } from "pinia"
import { computed, ref } from "vue"
import { getSession } from "@/services/session.service"
import { setActiveOrganization as setActiveOrganizationRequest } from "@/services/organization.service"
import type { CustomSession } from "@/types/auth.type"
import type { Permission } from "@/types/permission.type"

export const useSessionStore = defineStore("session", () => {
    const session = ref<CustomSession | null>(null)
    const loading = ref(false)
    const loaded = ref(false)

    const user = computed(() => session.value?.user ?? null)
    const permissions = computed(() => session.value?.permissions ?? [])
    const permissionSet = computed(() => new Set<Permission>(permissions.value))
    const roles = computed(() => session.value?.roles ?? [])
    const organizations = computed(() => session.value?.organizations ?? [])
    const activeOrganizationId = computed(() => session.value?.session.activeOrganizationId ?? null)
    const activeOrganization = computed(
        () => organizations.value.find((organization) => organization.id === activeOrganizationId.value) ?? null,
    )
    const isAuthenticated = computed(() => Boolean(session.value))

    function hasPermission(permission: Permission): boolean {
        return permissionSet.value.has(permission)
    }

    const can = hasPermission

    async function refreshSession(): Promise<CustomSession | null> {
        loading.value = true

        try {
            session.value = await getSession()
            loaded.value = true

            return session.value
        } catch (error) {
            session.value = null
            loaded.value = true
            throw error
        } finally {
            loading.value = false
        }
    }

    async function setActiveOrganization(organizationId: string | null) {
        await setActiveOrganizationRequest({ organizationId })
        await refreshSession()
    }

    function clearSession() {
        session.value = null
        loaded.value = true
    }

    return {
        session,
        loading,
        loaded,
        user,
        permissions,
        roles,
        organizations,
        activeOrganizationId,
        activeOrganization,
        isAuthenticated,
        can,
        hasPermission,
        refreshSession,
        setActiveOrganization,
        clearSession,
    }
})
