<script setup lang="ts">
import { Mail, ShieldCheck } from "@lucide/vue"
import { ref } from "vue"
import { toast } from "vue-sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { isApiError } from "@/services/api.service"
import { login, sendEmailOtp, signInEmailOtp } from "@/services/auth.service"

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
    await login({ email: passwordEmail.value, password: password.value })
    emit("authenticated")
  } catch (error) {
    toast.error(isApiError(error) ? error.message : "Unable to sign in")
  } finally {
    passwordPending.value = false
  }
}

async function handleSendOtp() {
  otpPending.value = true

  try {
    await sendEmailOtp({
      email: otpEmail.value,
      type: "sign-in",
    })
    otpSent.value = true
    toast.success("Verification code sent")
  } catch (error) {
    toast.error(isApiError(error) ? error.message : "Unable to send verification code")
  } finally {
    otpPending.value = false
  }
}

async function handleOtpSignIn() {
  otpPending.value = true

  try {
    await signInEmailOtp({
      email: otpEmail.value,
      otp: otpCode.value,
    })
    emit("authenticated")
  } catch (error) {
    toast.error(isApiError(error) ? error.message : "Unable to verify code")
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
