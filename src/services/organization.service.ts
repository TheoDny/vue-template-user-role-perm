import { apiRequest } from "@/services/api.service"
import type { SetActiveOrganizationRequest } from "@/types/organization.type"

export function setActiveOrganization(payload: SetActiveOrganizationRequest) {
  return apiRequest<unknown>("/auth/active-organization", {
    method: "POST",
    body: payload,
  })
}

