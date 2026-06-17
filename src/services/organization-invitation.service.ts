import { apiRequest } from "@/services/api.service"
import type {
    CreateInvitationRequest,
    OrganizationInvitation,
    PublicInvitation,
    UpdateInvitationRolesRequest,
} from "@/types/organization-invitation.type"

export function listInvitations() {
    return apiRequest<OrganizationInvitation[]>("/invitations")
}

export function createInvitation(payload: CreateInvitationRequest) {
    return apiRequest<OrganizationInvitation>("/invitations", {
        method: "POST",
        body: { ...payload, resend: true },
    })
}

export function resendInvitation(invitationId: string) {
    return apiRequest<OrganizationInvitation>(`/invitations/${invitationId}/resend`, {
        method: "POST",
    })
}

export function updateInvitationRoles(invitationId: string, payload: UpdateInvitationRolesRequest) {
    return apiRequest<OrganizationInvitation>(`/invitations/${invitationId}/roles`, {
        method: "PATCH",
        body: payload,
    })
}

export function cancelInvitation(invitationId: string) {
    return apiRequest<OrganizationInvitation>(`/invitations/${invitationId}/cancel`, {
        method: "POST",
    })
}

export function acceptInvitation(invitationId: string) {
    return apiRequest<unknown>(`/invitations/${invitationId}/accept`, {
        method: "POST",
    })
}

export function rejectInvitation(invitationId: string) {
    return apiRequest<unknown>(`/invitations/${invitationId}/reject`, {
        method: "POST",
    })
}

export function getPublicInvitation(organizationId: string, invitationId: string) {
    return apiRequest<PublicInvitation>(`/organizations/${organizationId}/invitations/${invitationId}`)
}
