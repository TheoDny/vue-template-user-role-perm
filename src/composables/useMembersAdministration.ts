import { parseRoleList, toUniqueRoles } from "@/lib/roles"
import { isApiError } from "@/services/api.service"
import { deleteMember, listMembers, updateMemberRoles } from "@/services/organization-member.service"
import { listRoles } from "@/services/organization-role.service"
import type { OrganizationMember } from "@/types/organization-member.type"
import { computed, ref } from "vue"
import { toast } from "vue-sonner"

export function getMemberLabel(member: OrganizationMember): string {
    return member.user?.name || member.user?.email || member.userId || member.id
}

export function useMembersAdministration() {
    const members = ref<OrganizationMember[]>([])
    const roleOptions = ref<string[]>([])
    const selectedMemberId = ref<string | null>(null)
    const loading = ref(false)
    const saving = ref(false)

    const selectedMember = computed(
        () => members.value.find((member) => member.id === selectedMemberId.value) ?? members.value[0] ?? null,
    )

    const selectedMemberRoles = computed(() => parseRoleList(selectedMember.value?.role))

    async function refresh() {
        loading.value = true

        try {
            const [nextMembers, dynamicRoles] = await Promise.all([listMembers(), listRoles()])
            members.value = Array.isArray(nextMembers) ? nextMembers : []
            console.log(members.value, nextMembers)
            roleOptions.value = Array.isArray(dynamicRoles) ? dynamicRoles.map((role) => role.role) : []

            if (!selectedMemberId.value || !members.value.some((member) => member.id === selectedMemberId.value)) {
                selectedMemberId.value = members.value[0]?.id ?? null
            }
        } catch (error) {
            toast.error(isApiError(error) ? error.message : "Unable to load members")
        } finally {
            loading.value = false
        }
    }

    async function updateRoles(member: OrganizationMember, roles: string[]) {
        saving.value = true

        try {
            await updateMemberRoles(member.id, { roles: toUniqueRoles(roles) })
            await refresh()
            toast.success("Member roles updated")
        } catch (error) {
            toast.error(isApiError(error) ? error.message : "Unable to update member roles")
            throw error
        } finally {
            saving.value = false
        }
    }

    async function remove(member: OrganizationMember) {
        saving.value = true

        try {
            await deleteMember(member.id)
            await refresh()
            toast.success("Member removed")
        } catch (error) {
            toast.error(isApiError(error) ? error.message : "Unable to remove member")
            throw error
        } finally {
            saving.value = false
        }
    }

    return {
        members,
        roleOptions,
        selectedMemberId,
        selectedMember,
        selectedMemberRoles,
        loading,
        saving,
        refresh,
        updateRoles,
        remove,
    }
}
