<script setup lang="ts">
import { ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { toast } from "vue-sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { login } from "@/services/auth.service"
import { isApiError } from "@/services/api.service"
import { useSessionStore } from "@/stores/session.store"

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()
const email = ref("")
const password = ref("")
const pending = ref(false)

async function handleSubmit() {
  pending.value = true

  try {
    await login({ email: email.value, password: password.value })
    await sessionStore.refreshSession()
    await router.replace(typeof route.query.redirect === "string" ? route.query.redirect : "/")
  } catch (error) {
    toast.error(isApiError(error) ? error.message : "Unable to sign in")
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="flex min-h-screen items-center justify-center bg-background p-6">
    <form
      class="flex w-full max-w-sm flex-col gap-6"
      @submit.prevent="handleSubmit"
    >
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl font-semibold tracking-normal">Sign in</h1>
        <p class="text-sm text-muted-foreground">Access your organization administration workspace.</p>
      </div>
      <FieldGroup>
        <Field>
          <FieldLabel for="email">Email</FieldLabel>
          <Input
            id="email"
            v-model="email"
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
        :disabled="pending"
      >
        {{ pending ? "Signing in..." : "Sign in" }}
      </Button>
    </form>
  </main>
</template>

