import type { OrganizationSummary } from "@/types/organization.type"
import type { Permission } from "@/types/permission.type"

export type LoginRequest = {
  email: string
  password: string
  rememberMe?: boolean
  callbackURL?: string
}

export type AuthenticatedResponse = {
  authenticated: boolean
}

export type SessionUser = {
  id: string
  name: string
  email: string
  image?: string | null
  role?: string | null
  banned?: boolean | null
  banReason?: string | null
  banExpires?: string | Date | null
}

export type UserSession = {
  id: string
  createdAt: string | Date
  updatedAt: string | Date
  userId: string
  expiresAt: string | Date
  token: string
  ipAddress: string | null
  userAgent: string | null
  activeOrganizationId: string | null
  impersonatedBy: string | null
}

export type CustomSession = {
  user: SessionUser
  session: UserSession
  permissions: Permission[]
  roles: string[]
  organizations: OrganizationSummary[]
}

