<script setup lang="ts">
import { computed, ref } from "vue"
import { toast } from "vue-sonner"
import { MailCheck, Save } from "@lucide/vue"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { getApiErrorMessage } from "@/services/api.service"
import { requestPasswordResetEmailOtp, resetPasswordEmailOtp } from "@/services/auth.service"
import { useSessionStore } from "@/stores/session.store"

const sessionStore = useSessionStore()
const otpSent = ref(false)
const otpCode = ref("")
const newPassword = ref("")
const confirmPassword = ref("")
const pending = ref(false)

const email = computed(() => sessionStore.user?.email ?? "")
const passwordsMatch = computed(() => newPassword.value === confirmPassword.value)
const canSubmitPassword = computed(
    () => otpSent.value && otpCode.value.length === 6 && newPassword.value.length >= 8 && passwordsMatch.value,
)

function showErrorToast(error: unknown, fallback: string) {
    const message = getApiErrorMessage(error, fallback)

    if (message) {
        toast.error(message)
    }
}

async function handleSendOtp() {
    if (!email.value) {
        return
    }

    pending.value = true

    try {
        await requestPasswordResetEmailOtp({ email: email.value })
        otpSent.value = true
        toast.success("Verification code sent")
    } catch (error) {
        showErrorToast(error, "Unable to send verification code")
    } finally {
        pending.value = false
    }
}

async function handleResetPassword() {
    if (!canSubmitPassword.value || !email.value) {
        return
    }

    pending.value = true

    try {
        await resetPasswordEmailOtp({
            email: email.value,
            otp: otpCode.value,
            password: newPassword.value,
        })
        otpCode.value = ""
        newPassword.value = ""
        confirmPassword.value = ""
        otpSent.value = false
        toast.success("Password updated")
    } catch (error) {
        showErrorToast(error, "Unable to update password")
    } finally {
        pending.value = false
    }
}
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Change your password with an email verification code.</CardDescription>
        </CardHeader>
        <CardContent>
            <form
                class="flex flex-col gap-5"
                @submit.prevent="handleResetPassword"
            >
                <FieldGroup>
                    <Field>
                        <FieldLabel for="account-email">Email</FieldLabel>
                        <Input
                            id="account-email"
                            :model-value="email"
                            disabled
                            type="email"
                        />
                        <FieldDescription>The verification code is sent to this email address.</FieldDescription>
                    </Field>

                    <Field v-if="otpSent">
                        <FieldLabel for="password-otp">Verification code</FieldLabel>
                        <InputOTP
                            id="password-otp"
                            v-model="otpCode"
                            :maxlength="6"
                            class="justify-start"
                        >
                            <InputOTPGroup>
                                <InputOTPSlot
                                    v-for="index in 6"
                                    :key="index"
                                    :index="index - 1"
                                />
                            </InputOTPGroup>
                        </InputOTP>
                    </Field>

                    <Field v-if="otpSent">
                        <FieldLabel for="new-password">New password</FieldLabel>
                        <Input
                            id="new-password"
                            v-model="newPassword"
                            autocomplete="new-password"
                            type="password"
                            minlength="8"
                        />
                        <FieldDescription>Use at least 8 characters.</FieldDescription>
                    </Field>

                    <Field
                        v-if="otpSent"
                        :data-invalid="confirmPassword.length > 0 && !passwordsMatch ? true : undefined"
                    >
                        <FieldLabel for="confirm-password">Confirm password</FieldLabel>
                        <Input
                            id="confirm-password"
                            v-model="confirmPassword"
                            autocomplete="new-password"
                            type="password"
                            minlength="8"
                            :aria-invalid="confirmPassword.length > 0 && !passwordsMatch"
                        />
                        <FieldDescription v-if="confirmPassword.length > 0 && !passwordsMatch">
                            Passwords do not match.
                        </FieldDescription>
                    </Field>
                </FieldGroup>

                <div class="flex flex-col gap-2 sm:flex-row">
                    <Button
                        type="button"
                        variant="outline"
                        :disabled="pending || !email"
                        @click="handleSendOtp"
                    >
                        <MailCheck data-icon="inline-start" />
                        {{ pending && !otpSent ? "Sending..." : otpSent ? "Send a new code" : "Send code" }}
                    </Button>
                    <Button
                        v-if="otpSent"
                        type="submit"
                        :disabled="pending || !canSubmitPassword"
                    >
                        <Save data-icon="inline-start" />
                        {{ pending ? "Saving..." : "Update password" }}
                    </Button>
                </div>
            </form>
        </CardContent>
    </Card>
</template>
