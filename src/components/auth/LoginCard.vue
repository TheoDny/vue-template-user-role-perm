<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { showErrorToast } from "@/lib/utils"
import { login, sendEmailOtp, signInEmailOtp } from "@/services/auth.service"
import { loginSchema, sendEmailOtpSchema, signInEmailOtpSchema } from "@/validators/auth.schema"
import { Mail, ShieldCheck } from "@lucide/vue"
import { ref } from "vue"
import { toast } from "vue-sonner"

const emit = defineEmits<{
    authenticated: []
}>()

const passwordEmail = ref("")
const password = ref("")
const otpEmail = ref("")
const otpCode = ref("")
const otpSent = ref(false)
const passwordPending = ref(false)
const otpPending = ref(false)

async function handlePasswordSignIn() {
    passwordPending.value = true

    try {
        const payload = loginSchema.parse({ email: passwordEmail.value, password: password.value })
        await login(payload)
        emit("authenticated")
    } catch (error) {
        showErrorToast(error, "Unable to sign in")
    } finally {
        passwordPending.value = false
    }
}

async function handleSendOtp() {
    otpPending.value = true

    try {
        const payload = sendEmailOtpSchema.parse({
            email: otpEmail.value,
            type: "sign-in",
        })
        await sendEmailOtp(payload)
        otpSent.value = true
        toast.success("Verification code sent")
    } catch (error) {
        showErrorToast(error, "Unable to send verification code")
    } finally {
        otpPending.value = false
    }
}

async function handleOtpSignIn() {
    otpPending.value = true

    try {
        const payload = signInEmailOtpSchema.parse({
            email: otpEmail.value,
            otp: otpCode.value,
        })
        await signInEmailOtp(payload)
        emit("authenticated")
    } catch (error) {
        showErrorToast(error, "Unable to verify code")
    } finally {
        otpPending.value = false
    }
}
</script>

<template>
    <Card class="w-full max-w-md">
        <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <p class="text-sm text-muted-foreground">Access your organization administration workspace.</p>
        </CardHeader>
        <CardContent>
            <Tabs
                default-value="otp"
                class="w-full"
            >
                <TabsList class="grid w-full grid-cols-2">
                    <TabsTrigger value="otp">
                        <Mail data-icon="inline-start" />
                        Email OTP
                    </TabsTrigger>
                    <TabsTrigger value="password">
                        <ShieldCheck data-icon="inline-start" />
                        Password
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="otp">
                    <form
                        class="flex flex-col gap-5"
                        @submit.prevent="otpSent ? handleOtpSignIn() : handleSendOtp()"
                    >
                        <FieldGroup>
                            <Field>
                                <FieldLabel for="otp-email">Email</FieldLabel>
                                <Input
                                    id="otp-email"
                                    v-model="otpEmail"
                                    autocomplete="email"
                                    type="email"
                                    required
                                />
                            </Field>
                            <Field v-if="otpSent">
                                <FieldLabel for="otp-code">Verification code</FieldLabel>
                                <InputOTP
                                    id="otp-code"
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
                        </FieldGroup>
                        <div class="flex flex-col gap-2">
                            <Button
                                type="submit"
                                :disabled="otpPending || !otpEmail || (otpSent && otpCode.length === 0)"
                            >
                                {{ otpPending ? "Please wait..." : otpSent ? "Verify code" : "Send code" }}
                            </Button>
                            <Button
                                v-if="otpSent"
                                type="button"
                                variant="ghost"
                                :disabled="otpPending"
                                @click="handleSendOtp"
                            >
                                Send a new code
                            </Button>
                        </div>
                    </form>
                </TabsContent>

                <TabsContent value="password">
                    <form
                        class="flex flex-col gap-5"
                        @submit.prevent="handlePasswordSignIn"
                    >
                        <FieldGroup>
                            <Field>
                                <FieldLabel for="password-email">Email</FieldLabel>
                                <Input
                                    id="password-email"
                                    v-model="passwordEmail"
                                    autocomplete="email"
                                    type="email"
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel for="password">Password</FieldLabel>
                                <Input
                                    id="password"
                                    v-model="password"
                                    autocomplete="current-password"
                                    type="password"
                                    required
                                />
                            </Field>
                        </FieldGroup>
                        <Button
                            type="submit"
                            :disabled="passwordPending"
                        >
                            {{ passwordPending ? "Signing in..." : "Sign in" }}
                        </Button>
                    </form>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
</template>
