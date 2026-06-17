import { apiRequest } from "@/services/api.service"
import type {
    AuthenticatedResponse,
    LoginRequest,
    SendEmailOtpRequest,
    SignInEmailOtpRequest,
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

export function signOut() {
    return apiRequest<unknown>("/auth/logout", {
        method: "POST",
    })
}

export function getAuthenticated() {
    return apiRequest<AuthenticatedResponse>("/auth/authenticated")
}
