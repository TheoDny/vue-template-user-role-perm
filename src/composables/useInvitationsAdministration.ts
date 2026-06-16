import { computed, ref } from "vue"
import { toast } from "vue-sonner"
import { isApiError } from "@/services/api.service"
import { listRoles } from "@/services/organization-role.service"
import {
  cancelInvitation,
  createInvitation,
  listInvitations,
  updateInvitationRoles,
} from "@/services/organization-invitation.service"
import { parseRoleList, staticRoleNames, toUniqueRoles } from "@/lib/roles"
import type { OrganizationInvitation } from "@/types/organization-invitation.type"

export function useInvitationsAdministration() {
  const invitations = ref<OrganizationInvitation[]>([])
  const roleOptions = ref<string[]>([])
  const selectedInvitationId = ref<string | null>(null)
  const loading = ref(false)
  const saving = ref(false)

  const selectedInvitation = computed(
    () =>
      invitations.value.find((invitation) => invitation.id === selectedInvitationId.value) ??
      invitations.value[0] ??
      null,
  )

  const selectedInvitationRoles = computed(() => parseRoleList(selectedInvitation.value?.role))

  async function refresh() {
    loading.value = true

    try {
      const [nextInvitations, dynamicRoles] = await Promise.all([listInvitations(), listRoles()])
      invitations.value = Array.isArray(nextInvitations) ? nextInvitations : []
      roleOptions.value = toUniqueRoles([
        ...staticRoleNames,
        ...(Array.isArray(dynamicRoles) ? dynamicRoles.map((role) => role.role) : []),
      ])

      if (
        !selectedInvitationId.value ||
        !invitations.value.some((invitation) => invitation.id === selectedInvitationId.value)
      ) {
        selectedInvitationId.value = invitations.value[0]?.id ?? null
      }
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Unable to load invitations")
    } finally {
      loading.value = false
    }
  }

  async function create(payload: { email: string; roles: string[]; resend?: boolean }) {
    saving.value = true

    try {
      await createInvitation({ ...payload, roles: toUniqueRoles(payload.roles) })
      await refresh()
      toast.success("Invitation created")
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Unable to create invitation")
      throw error
    } finally {
      saving.value = false
    }
  }

  async function updateRoles(invitation: OrganizationInvitation, roles: string[]) {
    saving.value = true

    try {
      await updateInvitationRoles(invitation.id, { roles: toUniqueRoles(roles) })
      await refresh()
      toast.success("Invitation roles updated")
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Unable to update invitation roles")
      throw error
    } finally {
      saving.value = false
    }
  }

  async function cancel(invitation: OrganizationInvitation) {
    saving.value = true

    try {
      await cancelInvitation(invitation.id)
      await refresh()
      toast.success("Invitation canceled")
    } catch (error) {
      toast.error(isApiError(error) ? error.message : "Unable to cancel invitation")
      throw error
    } finally {
      saving.value = false
    }
  }

  return {
    invitations,
    roleOptions,
    selectedInvitationId,
    selectedInvitation,
    selectedInvitationRoles,
    loading,
    saving,
    refresh,
    create,
    updateRoles,
    cancel,
  }
}

