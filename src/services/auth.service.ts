import { apiRequest } from "@/services/api.service"
import type { AuthenticatedResponse, LoginRequest } from "@/types/auth.type"

export function login(payload: LoginRequest) {
  return apiRequest<unknown>("/auth/login", {
    method: "POST",
    body: payload,
  })
}

export function signOut() {
  return apiRequest<unknown>("/auth/logout", {
    method: "POST",
  })
}

export function getAuthenticated() {
  return apiRequest<AuthenticatedResponse>("/auth/authenticated")
}

