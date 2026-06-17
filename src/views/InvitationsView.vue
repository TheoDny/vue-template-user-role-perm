<script setup lang="ts">
import InvitationDialogs from "@/components/invitations/InvitationDialogs.vue"
import InvitationRolesPanel from "@/components/invitations/InvitationRolesPanel.vue"
import InvitationsHeader from "@/components/invitations/InvitationsHeader.vue"
import InvitationsListPanel from "@/components/invitations/InvitationsListPanel.vue"
import { useInvitationsAdministration } from "@/composables/useInvitationsAdministration"
import { toUniqueRoles } from "@/lib/roles"
import { useSessionStore } from "@/stores/session.store"
import type { OrganizationInvitation } from "@/types/organization-invitation.type"
import { computed, onMounted, ref, watch } from "vue"

const sessionStore = useSessionStore()
const invitationsAdmin = useInvitationsAdministration()
const roleDraft = ref<string[]>([])
const createDialogOpen = ref(false)
const cancelDialogOpen = ref(false)
const invitationSearch = ref("")
const invitationToCancel = ref<OrganizationInvitation | null>(null)
const createEmail = ref("")
const createRoles = ref<string[]>([])

const selectedInvitation = computed(() => invitationsAdmin.selectedInvitation.value)
const canCreate = computed(() => sessionStore.hasPermission("invitation:create"))
const canUpdate = computed(() => sessionStore.hasPermission("invitation:update"))
const canCancel = computed(() => sessionStore.hasPermission("invitation:cancel"))
const isPending = computed(() => selectedInvitation.value?.status === "pending")
const hasChanges = computed(
    () =>
        JSON.stringify([...roleDraft.value].sort()) !==
        JSON.stringify([...invitationsAdmin.selectedInvitationRoles.value].sort()),
)
const canSave = computed(() =>
    Boolean(
        selectedInvitation.value &&
        isPending.value &&
        canUpdate.value &&
        roleDraft.value.length > 0 &&
        hasChanges.value,
    ),
)
const canSubmitCreate = computed(
    () => createEmail.value.includes("@") && createRoles.value.length > 0 && canCreate.value,
)

watch(
    () => selectedInvitation.value,
    () => {
        roleDraft.value = [...invitationsAdmin.selectedInvitationRoles.value]
    },
)

onMounted(async () => {
    await invitationsAdmin.refresh()
    roleDraft.value = [...invitationsAdmin.selectedInvitationRoles.value]
})

watch(
    () => sessionStore.activeOrganizationId,
    async () => {
        await invitationsAdmin.refresh()
        roleDraft.value = [...invitationsAdmin.selectedInvitationRoles.value]
    },
)

function selectInvitation(invitationId: string) {
    invitationsAdmin.selectedInvitationId.value = invitationId
}

function hasRole(role: string): boolean {
    return roleDraft.value.includes(role)
}

function hasCreateRole(role: string): boolean {
    return createRoles.value.includes(role)
}

function toggleRole(role: string, checked: boolean | "indeterminate") {
    const roles = new Set(roleDraft.value)

    if (checked === true) {
        roles.add(role)
    } else {
        roles.delete(role)
    }

    roleDraft.value = toUniqueRoles([...roles])
}

function toggleRoleState(role: string) {
    toggleRole(role, !hasRole(role))
}

function toggleCreateRole(role: string, checked: boolean | "indeterminate") {
    const roles = new Set(createRoles.value)

    if (checked === true) {
        roles.add(role)
    } else {
        roles.delete(role)
    }

    createRoles.value = toUniqueRoles([...roles])
}

function toggleCreateRoleState(role: string) {
    toggleCreateRole(role, !hasCreateRole(role))
}

function resetRoleDraft() {
    roleDraft.value = [...invitationsAdmin.selectedInvitationRoles.value]
}

function openCancelDialog(invitation: OrganizationInvitation) {
    invitationToCancel.value = invitation
    cancelDialogOpen.value = true
}

async function handleCreateInvitation() {
    await invitationsAdmin.create({
        email: createEmail.value.trim(),
        roles: createRoles.value,
    })
    createEmail.value = ""
    createRoles.value = []
    createDialogOpen.value = false
}

async function handleSaveRoles() {
    if (!selectedInvitation.value) {
        return
    }

    await invitationsAdmin.updateRoles(selectedInvitation.value, roleDraft.value)
}

async function handleCancelInvitation() {
    if (!invitationToCancel.value) {
        return
    }

    await invitationsAdmin.cancel(invitationToCancel.value)
    cancelDialogOpen.value = false
    invitationToCancel.value = null
}

async function handleResendInvitation(invitationId: string) {
    await invitationsAdmin.resend(invitationId)
}
</script>

<template>
    <section class="flex h-[calc(100svh-3.5rem)] flex-col gap-4 overflow-hidden p-4">
        <InvitationsHeader
            :can-create="canCreate"
            @create="createDialogOpen = true"
        />

        <div class="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(19rem,26rem)_1fr]">
            <InvitationsListPanel
                v-model:search="invitationSearch"
                :invitations="invitationsAdmin.invitations.value"
                :selected-invitation-id="invitationsAdmin.selectedInvitationId.value"
                :loading="invitationsAdmin.loading.value"
                :can-cancel="canCancel"
                :can-resend="canCreate"
                @select="selectInvitation"
                @cancel="openCancelDialog"
                @resend="handleResendInvitation"
            />

            <InvitationRolesPanel
                :selected-invitation="selectedInvitation"
                :role-options="invitationsAdmin.roleOptions.value"
                :role-draft="roleDraft"
                :selected-role-count="roleDraft.length"
                :has-changes="hasChanges"
                :is-pending="isPending"
                :loading="invitationsAdmin.loading.value"
                :saving="invitationsAdmin.saving.value"
                :can-update="canUpdate"
                :can-save="canSave"
                @toggle="toggleRoleState"
                @reset="resetRoleDraft"
                @save="handleSaveRoles"
            />
        </div>

        <InvitationDialogs
            v-model:create-open="createDialogOpen"
            v-model:cancel-open="cancelDialogOpen"
            v-model:create-email="createEmail"
            :create-roles="createRoles"
            :role-options="invitationsAdmin.roleOptions.value"
            :can-submit-create="canSubmitCreate"
            :saving="invitationsAdmin.saving.value"
            :invitation-to-cancel="invitationToCancel"
            @toggle-create-role="toggleCreateRoleState"
            @create="handleCreateInvitation"
            @cancel="handleCancelInvitation"
        />
    </section>
</template>
