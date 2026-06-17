<script setup lang="ts">
import MemberRolesPanel from "@/components/members/MemberRolesPanel.vue"
import MembersHeader from "@/components/members/MembersHeader.vue"
import MembersListPanel from "@/components/members/MembersListPanel.vue"
import RemoveMemberDialog from "@/components/members/RemoveMemberDialog.vue"
import { useMembersAdministration } from "@/composables/useMembersAdministration"
import { toUniqueRoles } from "@/lib/roles"
import { useSessionStore } from "@/stores/session.store"
import type { OrganizationMember } from "@/types/organization-member.type"
import { computed, onMounted, ref, watch } from "vue"

const sessionStore = useSessionStore()
const membersAdmin = useMembersAdministration()
const roleDraft = ref<string[]>([])
const deleteDialogOpen = ref(false)
const memberSearch = ref("")
const memberToRemove = ref<OrganizationMember | null>(null)

const selectedMember = computed(() => membersAdmin.selectedMember.value)
const canUpdate = computed(() => sessionStore.hasPermission("member:update"))
const canDelete = computed(() => sessionStore.hasPermission("member:delete"))
const hasChanges = computed(
  () => JSON.stringify([...roleDraft.value].sort()) !==
    JSON.stringify([...membersAdmin.selectedMemberRoles.value].sort()),
)
const canSave = computed(() => Boolean(selectedMember.value && canUpdate.value && roleDraft.value.length > 0 && hasChanges.value))

watch(
  () => selectedMember.value,
  () => {
    roleDraft.value = [...membersAdmin.selectedMemberRoles.value]
  },
)

onMounted(async () => {
  await membersAdmin.refresh()
  roleDraft.value = [...membersAdmin.selectedMemberRoles.value]
})

watch(
  () => sessionStore.activeOrganizationId,
  async () => {
    await membersAdmin.refresh()
    roleDraft.value = [...membersAdmin.selectedMemberRoles.value]
  },
)

function selectMember(memberId: string) {
  membersAdmin.selectedMemberId.value = memberId
}

function hasRole(role: string): boolean {
  return roleDraft.value.includes(role)
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

function resetRoleDraft() {
  roleDraft.value = [...membersAdmin.selectedMemberRoles.value]
}

function openRemoveMemberDialog(member: OrganizationMember) {
  memberToRemove.value = member
  deleteDialogOpen.value = true
}

async function handleSaveRoles() {
  if (!selectedMember.value) {
    return
  }

  await membersAdmin.updateRoles(selectedMember.value, roleDraft.value)
}

async function handleRefresh() {
  await membersAdmin.refresh()
  roleDraft.value = [...membersAdmin.selectedMemberRoles.value]
}

async function handleRemoveMember() {
  if (!memberToRemove.value) {
    return
  }

  await membersAdmin.remove(memberToRemove.value)
  deleteDialogOpen.value = false
  memberToRemove.value = null
}
</script>

<template>
  <section class="flex h-[calc(100svh-3.5rem)] flex-col gap-4 overflow-hidden p-4">
    <MembersHeader />

    <div class="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(19rem,26rem)_1fr]">
      <MembersListPanel
        v-model:search="memberSearch"
        :members="membersAdmin.members.value"
        :selected-member-id="membersAdmin.selectedMemberId.value"
        :loading="membersAdmin.loading.value"
        :can-delete="canDelete"
        :current-user-id="sessionStore.user?.id"
        @select="selectMember"
        @remove="openRemoveMemberDialog"
        @refresh="handleRefresh"
      />

      <MemberRolesPanel
        :selected-member="selectedMember"
        :role-options="membersAdmin.roleOptions.value"
        :role-draft="roleDraft"
        :selected-role-count="roleDraft.length"
        :has-changes="hasChanges"
        :loading="membersAdmin.loading.value"
        :saving="membersAdmin.saving.value"
        :can-update="canUpdate"
        :can-save="canSave"
        @toggle="toggleRoleState"
        @reset="resetRoleDraft"
        @save="handleSaveRoles"
      />
    </div>

    <RemoveMemberDialog
      v-model:open="deleteDialogOpen"
      :member="memberToRemove"
      :saving="membersAdmin.saving.value"
      @confirm="handleRemoveMember"
    />
  </section>
</template>
