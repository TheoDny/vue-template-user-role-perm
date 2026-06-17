<script setup lang="ts">
import { computed } from "vue"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSessionStore } from "@/stores/session.store"

const sessionStore = useSessionStore()

const fallback = computed(() => {
    const user = sessionStore.user

    if (!user) {
        return ""
    }

    return user.name.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()
})
</script>

<template>
    <section class="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
        <div class="flex flex-col gap-1">
            <h1 class="text-2xl font-semibold tracking-normal">Account</h1>
            <p class="text-sm text-muted-foreground">Current authenticated user and organization context.</p>
        </div>
        <Card v-if="sessionStore.user">
            <CardHeader>
                <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent class="flex flex-col gap-4">
                <div class="flex items-center gap-3">
                    <Avatar size="lg">
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
                <div class="flex flex-wrap gap-2">
                    <Badge
                        v-for="role in sessionStore.roles"
                        :key="role"
                        variant="secondary"
                    >
                        {{ role }}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    </section>
</template>
