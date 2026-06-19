import { z } from "zod"

const emailSchema = z.string().trim().min(1, "Email is required").email("Enter a valid email address")
const otpSchema = z.string().trim().length(6, "Enter the 6-digit verification code")
const requiredPasswordSchema = z.string().min(1, "Password is required")

export const loginSchema = z.object({
    email: emailSchema,
    password: requiredPasswordSchema,
    rememberMe: z.boolean().optional(),
    callbackURL: z.string().url("Enter a valid callback URL").optional(),
})

export const sendEmailOtpSchema = z.object({
    email: emailSchema,
    type: z.enum(["sign-in", "change-email", "email-verification", "forget-password"]),
})

export const signInEmailOtpSchema = z.object({
    email: emailSchema,
    otp: otpSchema,
    name: z.string().trim().min(1, "Name is required").optional(),
    image: z.string().url("Enter a valid image URL").optional(),
})

export const requestPasswordResetEmailOtpSchema = z.object({
    email: emailSchema,
})

export const resetPasswordEmailOtpSchema = z.object({
    email: emailSchema,
    otp: otpSchema,
    password: z.string().min(8, "Use at least 8 characters"),
})

export const revokeSessionSchema = z.object({
    token: z.string().trim().min(1, "Session token is required"),
})
