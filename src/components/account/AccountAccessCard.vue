<script setup lang="ts">
import { computed } from "vue"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useSessionStore } from "@/stores/session.store"

const sessionStore = useSessionStore()

const groupedPermissions = computed(() => {
    const groups = new Map<string, string[]>()

    for (const permission of sessionStore.permissions) {
        const [resource, action] = permission.split(":")

        if (!resource || !action) {
            continue
        }

        groups.set(resource, [...(groups.get(resource) ?? []), action])
    }

    return [...groups.entries()]
        .map(([resource, actions]) => ({
            resource,
            actions: [...new Set(actions)].sort((left, right) => left.localeCompare(right)),
        }))
        .sort((left, right) => left.resource.localeCompare(right.resource))
})
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>Access</CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col gap-5">
            <div class="flex flex-col gap-2">
                <p class="text-sm font-medium">Assigned roles</p>
                <div
                    v-if="sessionStore.roles.length"
                    class="flex flex-wrap gap-2"
                >
                    <Badge
                        v-for="role in sessionStore.roles"
                        :key="role"
                        variant="secondary"
                    >
                        {{ role }}
                    </Badge>
                </div>
                <p
                    v-else
                    class="text-sm text-muted-foreground"
                >
                    No role is assigned in the active organization.
                </p>
            </div>

            <Separator />

            <div class="flex flex-col gap-3">
                <p class="text-sm font-medium">Permissions</p>
                <div
                    v-if="groupedPermissions.length"
                    class="flex flex-col gap-3"
                >
                    <div
                        v-for="group in groupedPermissions"
                        :key="group.resource"
                        class="flex flex-col gap-2 rounded-md border p-3"
                    >
                        <p class="text-sm font-medium">{{ group.resource }}</p>
                        <div class="flex flex-wrap gap-2">
                            <Badge
                                v-for="action in group.actions"
                                :key="`${group.resource}:${action}`"
                                variant="outline"
                            >
                                {{ action }}
                            </Badge>
                        </div>
                    </div>
                </div>
                <p
                    v-else
                    class="text-sm text-muted-foreground"
                >
                    No permission is granted in the active organization.
                </p>
            </div>
        </CardContent>
    </Card>
</template>
