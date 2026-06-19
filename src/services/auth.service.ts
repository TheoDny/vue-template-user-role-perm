import { apiRequest } from "@/services/api.service"
import type {
    AuthenticatedResponse,
    LoginRequest,
    RequestPasswordResetEmailOtpRequest,
    ResetPasswordEmailOtpRequest,
    RevokeSessionRequest,
    SendEmailOtpRequest,
    SignInEmailOtpRequest,
    UserSessionSummary,
} from "@/types/auth.type"

export function login(payload: LoginRequest) {
    return apiRequest<unknown>("/auth/login", {
        method: "POST",
        body: payload,
    })
}

export function sendEmailOtp(payload: SendEmailOtpRequest) {
    return apiRequest<unknown>("/auth/email-otp/send", {
        method: "POST",
        body: payload,
    })
}

export function signInEmailOtp(payload: SignInEmailOtpRequest) {
    return apiRequest<unknown>("/auth/email-otp/sign-in", {
        method: "POST",
        body: payload,
    })
}

export function requestPasswordResetEmailOtp(payload: RequestPasswordResetEmailOtpRequest) {
    return apiRequest<unknown>("/auth/password-reset/email-otp", {
        method: "POST",
        body: payload,
    })
}

export function resetPasswordEmailOtp(payload: ResetPasswordEmailOtpRequest) {
    return apiRequest<{ success: boolean }>("/auth/email-otp/reset-password", {
        method: "POST",
        body: payload,
    })
}

export function listSessions() {
    return apiRequest<UserSessionSummary[]>("/auth/sessions")
}

export function revokeSession(payload: RevokeSessionRequest) {
    return apiRequest<{ status?: boolean; success?: boolean }>("/auth/sessions/revoke", {
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
