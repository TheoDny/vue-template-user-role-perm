import { z } from "zod"

const permissionActionSchema = z.string().trim().min(1, "Permission action is required")

export const roleIdSchema = z.string().trim().min(1, "Role id is required")

export const permissionMatrixSchema = z.record(
    z.string().trim().min(1, "Permission resource is required"),
    z.array(permissionActionSchema),
)

export const createRoleSchema = z.object({
    role: z.string().trim().min(1, "Role name is required"),
    permissions: permissionMatrixSchema.optional(),
})

export const updateRoleNameSchema = z.object({
    name: z.string().trim().min(1, "Role name is required"),
})

export const updateRolePermissionsSchema = z.object({
    permissions: permissionMatrixSchema,
})
