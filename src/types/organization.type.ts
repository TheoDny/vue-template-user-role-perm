export type OrganizationSummary = {
  id: string
  name: string
  slug?: string | null
}

export type SetActiveOrganizationRequest = {
  organizationId?: string | null
  organizationSlug?: string
}

