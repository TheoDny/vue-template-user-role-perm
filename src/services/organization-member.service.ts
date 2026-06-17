import { apiRequest } from "@/services/api.service"
import type { OrganizationMember, UpdateMemberRolesRequest } from "@/types/organization-member.type"

export function listMembers() {
    return apiRequest<OrganizationMember[]>("/members")
}

export function updateMemberRoles(memberId: string, payload: UpdateMemberRolesRequest) {
    return apiRequest<OrganizationMember>(`/members/${memberId}/roles`, {
        method: "PATCH",
        body: payload,
    })
}

export function deleteMember(memberId: string) {
    return apiRequest<unknown>(`/members/${memberId}`, {
        method: "DELETE",
    })
}
