import { z } from "zod"

export const setActiveOrganizationSchema = z
    .object({
        organizationId: z.string().trim().min(1, "Organization id is required").nullable().optional(),
        organizationSlug: z.string().trim().min(1, "Organization slug is required").optional(),
    })
    .refine((payload) => payload.organizationId !== undefined || payload.organizationSlug !== undefined, {
        message: "Select an organization",
    })
