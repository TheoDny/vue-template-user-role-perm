<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { getMemberLabel } from "@/composables/useMembersAdministration"
import type { OrganizationMember } from "@/types/organization-member.type"
import { RotateCcw, Save, ShieldCheck } from "@lucide/vue"

defineProps<{
    selectedMember: OrganizationMember | null
    roleOptions: string[]
    roleDraft: string[]
    selectedRoleCount: number
    hasChanges: boolean
    loading: boolean
    saving: boolean
    canUpdate: boolean
    canSave: boolean
}>()

const emit = defineEmits<{
    toggle: [role: string]
    reset: []
    save: []
}>()

function getMemberFallback(label: string): string {
    const parts = label.trim().split(/\s+/).filter(Boolean)

    if (parts.length > 1) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    }

    return label.charAt(0).toUpperCase()
}

function formatRole(role: string): string {
    return role.replace(/[-_]/g, " ")
}
</script>

<template>
    <Card
        class="min-h-0"
        size="sm"
    >
        <CardHeader class="border-b">
            <CardTitle>{{ selectedMember ? getMemberLabel(selectedMember) : "Assignable roles" }}</CardTitle>
            <CardDescription>
                {{ selectedMember ? "Select one or more roles, then save." : "Select a member to assign roles." }}
            </CardDescription>
            <CardAction>
                <div class="flex flex-wrap justify-end gap-2">
                    <Badge
                        v-if="hasChanges"
                        variant="secondary"
                    >
                        Unsaved changes
                    </Badge>
                </div>
            </CardAction>
        </CardHeader>

        <CardContent class="flex flex-1 min-h-0 flex-col gap-4 overflow-hidden">
            <template v-if="loading">
                <Skeleton
                    v-for="index in 4"
                    :key="index"
                    class="h-24 rounded-lg"
                />
            </template>
            <template v-else-if="selectedMember">
                <div class="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                    <Avatar>
                        <AvatarImage
                            :src="selectedMember.user?.image ?? ''"
                            :alt="getMemberLabel(selectedMember)"
                        />
                        <AvatarFallback>{{ getMemberFallback(getMemberLabel(selectedMember)) }}</AvatarFallback>
                    </Avatar>
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-medium">{{ getMemberLabel(selectedMember) }}</p>
                        <p class="truncate text-xs text-muted-foreground">
                            {{ selectedMember.user?.email ?? selectedMember.userId }}
                        </p>
                    </div>
                </div>

                <div class="min-h-0 overflow-auto pr-1">
                    <FieldGroup>
                        <FieldSet class="gap-3">
                            <FieldLegend>Roles</FieldLegend>
                            <div class="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
                                <Field
                                    v-for="role in roleOptions"
                                    :key="role"
                                    orientation="horizontal"
                                    class="cursor-pointer items-center gap-2 rounded-lg border bg-background p-3 transition-colors has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
                                    :data-disabled="!canUpdate || undefined"
                                    @click="canUpdate && emit('toggle', role)"
                                >
                                    <Checkbox
                                        :model-value="roleDraft.includes(role)"
                                        :disabled="!canUpdate"
                                        @click.stop
                                        @update:model-value="emit('toggle', role)"
                                    />
                                    <FieldLabel class="pointer-events-none capitalize">{{
                                        formatRole(role)
                                    }}</FieldLabel>
                                </Field>
                            </div>
                        </FieldSet>
                    </FieldGroup>
                </div>
            </template>
            <div
                v-else
                class="flex flex-1 min-h-80 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground"
            >
                <ShieldCheck />
                <span>Select a member to assign roles.</span>
            </div>
        </CardContent>

        <CardFooter class="flex flex-wrap items-center justify-between gap-2 border-t px-3 py-3">
            <div class="text-xs text-muted-foreground">
                {{
                    canUpdate
                        ? "Changes are applied only after saving."
                        : "You need update permission to edit member roles."
                }}
            </div>
            <div class="flex flex-wrap justify-end gap-2">
                <Button
                    variant="outline"
                    :disabled="!hasChanges || saving"
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
                    Save roles
                </Button>
            </div>
        </CardFooter>
    </Card>
</template>
