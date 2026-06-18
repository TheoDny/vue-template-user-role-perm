import { z } from "zod"

const roleSchema = z.string().trim().min(1, "Role is required")

export const memberIdSchema = z.string().trim().min(1, "Member id is required")

export const updateMemberRolesSchema = z.object({
    roles: z
        .array(roleSchema)
        .min(1, "Select at least one role")
        .transform((roles) => [...new Set(roles)]),
})
