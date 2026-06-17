<script setup lang="ts">
import { computed } from "vue"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSessionStore } from "@/stores/session.store"

const sessionStore = useSessionStore()

const fallback = computed(() => {
    const user = sessionStore.user

    if (!user) {
        return ""
    }

    const parts = user.name.trim().split(/\s+/).filter(Boolean)

    if (parts.length > 1) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    }

    return (parts[0]?.charAt(0) || user.email.charAt(0)).toUpperCase()
})
</script>

<template>
    <Card v-if="sessionStore.user">
        <CardHeader>
            <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
                <Avatar>
                    <AvatarImage
                        :src="sessionStore.user.image ?? ''"
                        :alt="sessionStore.user.name"
                    />
                    <AvatarFallback>{{ fallback }}</AvatarFallback>
                </Avatar>
                <div class="min-w-0">
                    <p class="truncate font-medium">{{ sessionStore.user.name }}</p>
                    <p class="truncate text-sm text-muted-foreground">{{ sessionStore.user.email }}</p>
                </div>
            </div>
        </CardContent>
    </Card>
</template>
