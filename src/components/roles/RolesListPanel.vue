<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getRoleKey, getRoleLabel } from "@/composables/useRolesAdministration"
import { cn } from "@/lib/utils"
import type { OrganizationRole } from "@/types/organization-role.type"
import type { PermissionMatrix } from "@/types/permission.type"
import { Pencil, RefreshCw, ShieldCheck, Trash2, X } from "@lucide/vue"
import { computed } from "vue"

const props = defineProps<{
    roles: OrganizationRole[]
    selectedRoleKey: string | null
    search: string
    loading: boolean
    canUpdate: boolean
    canDelete: boolean
}>()

const emit = defineEmits<{
    "update:search": [value: string]
    select: [role: OrganizationRole]
    rename: [role: OrganizationRole]
    delete: [role: OrganizationRole]
    refresh: []
}>()

const filteredRoles = computed(() => {
    const search = props.search.trim().toLowerCase()

    if (!search) {
        return props.roles
    }

    return props.roles.filter((role) => {
        const label = getRoleLabel(role).toLowerCase()
        const key = getRoleKey(role).toLowerCase()

        return label.includes(search) || key.includes(search)
    })
})

function countPermissions(permissions: PermissionMatrix = {}): number {
    return Object.values(permissions).reduce((count, actions) => count + actions.length, 0)
}

function getRolePermissionCount(role: OrganizationRole): number {
    return countPermissions(role.permissions ?? role.permission)
}

function getRoleButtonClass(role: OrganizationRole): string {
    const isActive = getRoleKey(role) === props.selectedRoleKey

    return cn(
        "group flex min-w-0 flex-1 items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted",
        isActive && "border-primary bg-primary/5 shadow-sm",
    )
}

function clearSearch() {
    emit("update:search", "")
}

function handleRename(role: OrganizationRole) {
    emit("select", role)
    emit("rename", role)
}

function handleDelete(role: OrganizationRole) {
    emit("select", role)
    emit("delete", role)
}
</script>

<template>
    <Card
        class="min-h-0"
        size="sm"
    >
        <CardHeader>
            <CardTitle>Role list</CardTitle>
            <CardDescription>{{ roles.length }} roles in this organization</CardDescription>
            <CardAction>
                <div class="flex flex-wrap justify-end gap-2">
                    <Tooltip>
                        <TooltipTrigger as-child>
                            <Button
                                variant="outline"
                                size="icon"
                                :disabled="loading"
                                aria-label="Refresh roles"
                                @click="emit('refresh')"
                            >
                                <RefreshCw />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>Refresh roles</TooltipContent>
                    </Tooltip>
                </div>
            </CardAction>
        </CardHeader>
        <CardContent class="flex min-h-0 flex-col gap-3">
            <div class="flex gap-2">
                <Input
                    :model-value="search"
                    placeholder="Search roles..."
                    aria-label="Search roles"
                    @update:model-value="(value) => emit('update:search', String(value))"
                />
                <Button
                    variant="outline"
                    size="icon"
                    :disabled="!search"
                    aria-label="Clear role search"
                    @click="clearSearch"
                >
                    <X />
                </Button>
            </div>

            <div class="flex min-h-0 flex-col gap-2 overflow-auto pr-1">
                <template v-if="loading">
                    <Skeleton
                        v-for="index in 5"
                        :key="index"
                        class="h-16 rounded-lg"
                    />
                </template>
                <template v-else-if="filteredRoles.length">
                    <div
                        v-for="role in filteredRoles"
                        :key="getRoleKey(role)"
                        class="flex gap-2"
                    >
                        <button
                            type="button"
                            :class="getRoleButtonClass(role)"
                            :data-active="getRoleKey(role) === selectedRoleKey || undefined"
                            @click="emit('select', role)"
                        >
                            <ShieldCheck
                                :class="
                                    getRoleKey(role) === selectedRoleKey ? 'text-primary' : 'text-muted-foreground'
                                "
                            />
                            <span class="flex min-w-0 flex-1 flex-col gap-1">
                                <span class="truncate font-medium">{{ getRoleLabel(role) }}</span>
                                <span class="text-xs text-muted-foreground">
                                    {{ getRolePermissionCount(role) }} permissions
                                </span>
                            </span>
                            <Badge variant="secondary">
                                {{ role.role }}
                            </Badge>
                            <div class="flex shrink-0 gap-1">
                                <Tooltip>
                                    <TooltipTrigger as-child>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            :disabled="!canUpdate"
                                            @click="handleRename(role)"
                                        >
                                            <Pencil />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Rename role</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                    <TooltipTrigger as-child>
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            :disabled="role.role === 'owner' || !canDelete"
                                            @click="handleDelete(role)"
                                        >
                                            <Trash2 />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete role</TooltipContent>
                                </Tooltip>
                            </div>
                        </button>
                    </div>
                </template>
                <div
                    v-else
                    class="flex min-h-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground"
                >
                    <span>No roles found.</span>
                    <Button
                        v-if="search"
                        variant="outline"
                        size="sm"
                        @click="clearSearch"
                    >
                        Clear search
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>
</template>
