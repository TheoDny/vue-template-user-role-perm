import { z } from "zod"

const roleSchema = z.string().trim().min(1, "Role is required")
const roleListSchema = z
    .array(roleSchema)
    .min(1, "Select at least one role")
    .transform((roles) => [...new Set(roles)])

export const invitationIdSchema = z.string().trim().min(1, "Invitation id is required")

export const publicInvitationParamsSchema = z.object({
    organizationId: z.string().trim().min(1, "Organization id is required"),
    invitationId: invitationIdSchema,
})

export const createInvitationSchema = z.object({
    email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
    roles: roleListSchema,
    resend: z.boolean().optional(),
})

export const updateInvitationRolesSchema = z.object({
    roles: roleListSchema,
})
