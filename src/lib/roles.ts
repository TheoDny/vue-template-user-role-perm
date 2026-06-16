export const staticRoleNames = ["owner", "admin", "member"] as const

export function parseRoleList(value: string | string[] | null | undefined): string[] {
  if (Array.isArray(value)) {
    return value.map((role) => role.trim()).filter(Boolean)
  }

  return (value ?? "")
    .split(",")
    .map((role) => role.trim())
    .filter(Boolean)
}

export function toUniqueRoles(roles: string[]): string[] {
  return [...new Set(roles.map((role) => role.trim()).filter(Boolean))]
}

