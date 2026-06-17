import { apiRequest } from "@/services/api.service"
import type { CustomSession } from "@/types/auth.type"

export function getSession() {
    return apiRequest<CustomSession>("/auth/session")
}
