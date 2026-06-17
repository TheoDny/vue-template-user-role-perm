<script setup lang="ts">
import { computed, onMounted } from "vue"
import { useRouter } from "vue-router"
import { getFirstAllowedAdministrationRouteName } from "@/lib/admin-navigation"
import { useSessionStore } from "@/stores/session.store"

const router = useRouter()
const sessionStore = useSessionStore()

const firstAllowedRoute = computed(() => {
    return getFirstAllowedAdministrationRouteName(sessionStore.hasPermission)
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
