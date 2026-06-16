<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { useSessionStore } from "@/stores/session.store"

const router = useRouter()
const sessionStore = useSessionStore()

const firstAllowedRoute = computed(() => {
  if (sessionStore.hasPermission("ac:read")) {
    return "admin-roles"
  }

  if (sessionStore.hasPermission("member:read")) {
    return "admin-members"
  }

  if (sessionStore.hasPermission("invitation:read")) {
    return "admin-invitations"
  }

  return "access-denied"
})

onMounted(() => {
  void router.replace({ name: firstAllowedRoute.value })
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
    Loading workspace...
  </div>
</template>

