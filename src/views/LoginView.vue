<script setup lang="ts">
import { useRoute, useRouter } from "vue-router"
import LoginCard from "@/components/auth/LoginCard.vue"
import { useSessionStore } from "@/stores/session.store"

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()

async function handleAuthenticated() {
    await sessionStore.refreshSession()
    await router.replace(typeof route.query.redirect === "string" ? route.query.redirect : "/")
}
</script>

<template>
    <main class="flex min-h-screen items-center justify-center bg-background p-6">
        <LoginCard @authenticated="handleAuthenticated" />
    </main>
</template>
