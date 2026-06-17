<script setup lang="ts">
import { Plus, ShieldCheck } from "@lucide/vue"
import { Button } from "@/components/ui/button"

defineProps<{
    canCreate: boolean
}>()

const emit = defineEmits<{
    create: []
}>()
</script>

<template>
    <div class="flex flex-wrap items-start justify-between gap-3">
        <div class="flex min-w-0 items-start gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card">
                <ShieldCheck />
            </div>
            <div class="min-w-0">
                <h1 class="text-2xl font-semibold tracking-normal">Roles</h1>
                <p class="text-sm text-muted-foreground">Manage organization roles and permission sets.</p>
            </div>
        </div>
        <Button
            :disabled="!canCreate"
            @click="emit('create')"
        >
            <Plus data-icon="inline-start" />
            Create role
        </Button>
    </div>
</template>
