<script setup lang="ts">
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { getRoleLabel } from "@/composables/useRolesAdministration"
import type { OrganizationRole } from "@/types/organization-role.type"
import type { PermissionMatrix } from "@/types/permission.type"
import { RotateCcw, Save, ShieldCheck } from "@lucide/vue"

defineProps<{
    selectedRole: OrganizationRole | null
    draftPermissions: PermissionMatrix
    permissionEntries: [string, readonly string[]][]
    selectedPermissionCount: number
    totalAvailablePermissions: number
    hasPermissionChanges: boolean
    loading: boolean
    saving: boolean
    canUpdate: boolean
    canSave: boolean
}>()

const emit = defineEmits<{
    toggle: [resource: string, action: string]
    reset: []
    save: []
}>()

function formatLabel(value: string): string {
    return value.replace(/[-_]/g, " ")
}
</script>

<template>
    <Card
        class="min-h-0"
        size="sm"
    >
        <CardHeader class="border-b">
            <CardTitle>{{ selectedRole ? getRoleLabel(selectedRole) : "Permissions" }}</CardTitle>
            <CardDescription>
                {{
                    selectedRole ? "Select permissions, then save changes." : "Select a role to edit permissions."
                }}
            </CardDescription>
            <CardAction>
                <div class="flex flex-wrap justify-end gap-2">
                    <Badge
                        v-if="hasPermissionChanges"
                        variant="secondary"
                    >
                        Unsaved changes
                    </Badge>
                    <Badge variant="outline">
                        {{ selectedPermissionCount }} / {{ totalAvailablePermissions }}
                    </Badge>
                </div>
            </CardAction>
        </CardHeader>

        <CardContent class="flex flex-1 min-h-0 flex-col gap-4 overflow-hidden">
            <template v-if="loading">
                <Skeleton
                    v-for="index in 4"
                    :key="index"
                    class="h-28 rounded-lg"
                />
            </template>
            <div
                v-else-if="selectedRole"
                class="min-h-0 overflow-auto pr-1"
            >
                <FieldGroup class="flex-1">
                    <FieldSet
                        v-for="[resource, actions] in permissionEntries"
                        :key="resource"
                        class="gap-3 rounded-lg border p-4"
                    >
                        <FieldLegend class="capitalize">{{ formatLabel(resource) }}</FieldLegend>

                        <div class="grid gap-2 sm:grid-cols-2 2xl:grid-cols-4">
                            <Field
                                v-for="action in actions"
                                :key="`${resource}:${action}`"
                                orientation="horizontal"
                                class="cursor-pointer items-center gap-2 rounded-lg border bg-background p-3 transition-colors has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                                :data-disabled="!canUpdate || undefined"
                                @click="canUpdate && emit('toggle', resource, action)"
                            >
                                <Checkbox
                                    :model-value="draftPermissions[resource]?.includes(action) ?? false"
                                    :disabled="!canUpdate"
                                    @click.stop
                                    @update:model-value="emit('toggle', resource, action)"
                                />
                                <FieldLabel class="pointer-events-none capitalize">{{
                                    formatLabel(action)
                                }}</FieldLabel>
                            </Field>
                        </div>
                    </FieldSet>
                </FieldGroup>
            </div>
            <div
                v-else
                class="flex min-h-80 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
            >
                <ShieldCheck />
                <span>Select a role to edit permissions.</span>
            </div>
        </CardContent>

        <CardFooter class="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-3">
            <div class="text-xs text-muted-foreground">
                {{
                    canUpdate
                        ? "Changes are applied only after saving."
                        : "You need update permission to edit this role."
                }}
            </div>
            <div class="flex flex-wrap justify-end gap-2">
                <Button
                    variant="outline"
                    :disabled="!hasPermissionChanges || saving"
                    @click="emit('reset')"
                >
                    <RotateCcw data-icon="inline-start" />
                    Reset
                </Button>
                <Button
                    :disabled="!canSave || saving"
                    @click="emit('save')"
                >
                    <Save data-icon="inline-start" />
                    Save changes
                </Button>
            </div>
        </CardFooter>
    </Card>
</template>
