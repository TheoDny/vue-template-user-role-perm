<script setup lang="ts">
import RoleDialogs from "@/components/roles/RoleDialogs.vue"
import RolePermissionsPanel from "@/components/roles/RolePermissionsPanel.vue"
import RolesHeader from "@/components/roles/RolesHeader.vue"
import RolesListPanel from "@/components/roles/RolesListPanel.vue"
import { getRoleKey, getRoleLabel, useRolesAdministration } from "@/composables/useRolesAdministration"
import { useSessionStore } from "@/stores/session.store"
import type { OrganizationRole } from "@/types/organization-role.type"
import type { PermissionMatrix } from "@/types/permission.type"
import { computed, onMounted, ref, watch } from "vue"

const sessionStore = useSessionStore()
const rolesAdmin = useRolesAdministration()
const draftPermissions = ref<PermissionMatrix>({})
const createDialogOpen = ref(false)
const renameDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const roleNameDraft = ref("")
const createRoleName = ref("")
const roleSearch = ref("")
const actionRole = ref<OrganizationRole | null>(null)

const selectedRole = computed(() => rolesAdmin.selectedRole.value)
const permissionResources = computed(() => rolesAdmin.permissionCatalog.value?.resources ?? {})
const canCreate = computed(() => sessionStore.hasPermission("ac:create"))
const canUpdate = computed(() => sessionStore.hasPermission("ac:update"))
const canDelete = computed(() => sessionStore.hasPermission("ac:delete"))
const canSave = computed(() => Boolean(selectedRole.value && canUpdate.value && hasPermissionChanges.value))

const permissionEntries = computed<[string, readonly string[]][]>(() =>
    Object.entries(permissionResources.value).sort(([left], [right]) => left.localeCompare(right)),
)

const totalAvailablePermissions = computed(() =>
    permissionEntries.value.reduce((count, [, actions]) => count + actions.length, 0),
)

const selectedPermissionCount = computed(() => countPermissions(draftPermissions.value))

const hasPermissionChanges = computed(
    () =>
        JSON.stringify(normalizePermissionOrder(draftPermissions.value)) !==
        JSON.stringify(normalizePermissionOrder(rolesAdmin.selectedPermissions.value)),
)

watch(
    () => selectedRole.value,
    () => {
        draftPermissions.value = clonePermissions(rolesAdmin.selectedPermissions.value)
    },
)

onMounted(async () => {
    await rolesAdmin.refresh()
    draftPermissions.value = clonePermissions(rolesAdmin.selectedPermissions.value)
})

watch(
    () => sessionStore.activeOrganizationId,
    async () => {
        await rolesAdmin.refresh()
        draftPermissions.value = clonePermissions(rolesAdmin.selectedPermissions.value)
    },
)

function clonePermissions(permissions: PermissionMatrix): PermissionMatrix {
    return Object.fromEntries(
        Object.entries(permissions).map(([resource, actions]) => [resource, [...new Set(actions)]]),
    )
}

function normalizePermissionOrder(permissions: PermissionMatrix): PermissionMatrix {
    return Object.fromEntries(
        Object.entries(permissions)
            .sort(([left], [right]) => left.localeCompare(right))
            .map(([resource, actions]) => [resource, [...actions].sort()]),
    )
}

function countPermissions(permissions: PermissionMatrix): number {
    return Object.values(permissions).reduce((count, actions) => count + actions.length, 0)
}

function isPermissionChecked(resource: string, action: string): boolean {
    return draftPermissions.value[resource]?.includes(action) ?? false
}

function togglePermission(resource: string, action: string, checked: boolean | "indeterminate") {
    const currentActions = new Set(draftPermissions.value[resource] ?? [])

    if (checked === true) {
        currentActions.add(action)
    } else {
        currentActions.delete(action)
    }

    draftPermissions.value = {
        ...draftPermissions.value,
        [resource]: [...currentActions],
    }
}

function togglePermissionState(resource: string, action: string) {
    togglePermission(resource, action, !isPermissionChecked(resource, action))
}

function resetDraftPermissions() {
    draftPermissions.value = clonePermissions(rolesAdmin.selectedPermissions.value)
}

function selectRole(role: OrganizationRole) {
    rolesAdmin.selectedRoleKey.value = getRoleKey(role)
}

function openRenameDialog(role: OrganizationRole) {
    actionRole.value = role
    roleNameDraft.value = getRoleLabel(role)
    renameDialogOpen.value = true
}

function openDeleteDialog(role: OrganizationRole) {
    actionRole.value = role
    deleteDialogOpen.value = true
}

async function handleCreateRole() {
    const role = createRoleName.value.trim()

    if (!role) {
        return
    }

    await rolesAdmin.create({ role, permissions: {} })
    createRoleName.value = ""
    createDialogOpen.value = false
}

async function handleRenameRole() {
    if (!actionRole.value) {
        return
    }

    await rolesAdmin.rename(actionRole.value, roleNameDraft.value.trim())
    renameDialogOpen.value = false
    actionRole.value = null
}

async function handleSavePermissions() {
    if (!selectedRole.value) {
        return
    }

    await rolesAdmin.updatePermissions(selectedRole.value, draftPermissions.value)
}

async function handleDeleteRole() {
    if (!actionRole.value) {
        return
    }

    await rolesAdmin.remove(actionRole.value)
    deleteDialogOpen.value = false
    actionRole.value = null
}

async function handleRefresh() {
    await rolesAdmin.refresh()
    draftPermissions.value = clonePermissions(rolesAdmin.selectedPermissions.value)
}
</script>

<template>
    <section class="flex h-[calc(100svh-3.5rem)] flex-col gap-4 overflow-hidden p-4">
        <RolesHeader
            :can-create="canCreate"
            @create="createDialogOpen = true"
        />

        <div class="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(18rem,24rem)_1fr]">
            <RolesListPanel
                v-model:search="roleSearch"
                :roles="rolesAdmin.roles.value"
                :selected-role-key="rolesAdmin.selectedRoleKey.value"
                :loading="rolesAdmin.loading.value"
                :can-update="canUpdate"
                :can-delete="canDelete"
                @select="selectRole"
                @rename="openRenameDialog"
                @delete="openDeleteDialog"
                @refresh="handleRefresh"
            />

            <RolePermissionsPanel
                :selected-role="selectedRole"
                :draft-permissions="draftPermissions"
                :permission-entries="permissionEntries"
                :selected-permission-count="selectedPermissionCount"
                :total-available-permissions="totalAvailablePermissions"
                :has-permission-changes="hasPermissionChanges"
                :loading="rolesAdmin.loading.value"
                :saving="rolesAdmin.saving.value"
                :can-update="canUpdate"
                :can-save="canSave"
                @toggle="togglePermissionState"
                @reset="resetDraftPermissions"
                @save="handleSavePermissions"
            />
        </div>

        <RoleDialogs
            v-model:create-open="createDialogOpen"
            v-model:rename-open="renameDialogOpen"
            v-model:delete-open="deleteDialogOpen"
            v-model:create-role-name="createRoleName"
            v-model:role-name-draft="roleNameDraft"
            :saving="rolesAdmin.saving.value"
            @create="handleCreateRole"
            @rename="handleRenameRole"
            @delete="handleDeleteRole"
        />
    </section>
</template>
