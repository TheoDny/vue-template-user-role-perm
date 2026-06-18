export type InvitationStatus = "pending" | "accepted" | "rejected" | "canceled" | "expired" | string

export type OrganizationInvitation = {
    id: string
    email: string
    role: string | string[]
    status: InvitationStatus
    expiresAt?: string
    inviterId?: string
    organizationId?: string
}

export type InvitationOrgAndInviter = OrganizationInvitation & {
    organization?: {
        id: string
        name: string
        slug?: string | null
    }
    inviter?: {
        name: string
        email: string
    }
}

export type CreateInvitationRequest = {
    email: string
    roles: string[]
    resend?: boolean
}

export type UpdateInvitationRolesRequest = {
    roles: string[]
}
