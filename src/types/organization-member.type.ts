export type OrganizationMemberUser = {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export type OrganizationMember = {
  id: string
  userId?: string
  role: string | string[]
  createdAt?: string
  user?: OrganizationMemberUser
}

export type UpdateMemberRolesRequest = {
  roles: string[]
}

