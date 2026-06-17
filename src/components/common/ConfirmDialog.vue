<script setup lang="ts">
import type { ButtonVariants } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

withDefaults(
    defineProps<{
        open: boolean
        title: string
        description: string
        cancelLabel?: string
        confirmLabel: string
        pending?: boolean
        pendingLabel?: string
        confirmVariant?: ButtonVariants["variant"]
    }>(),
    {
        cancelLabel: "Cancel",
        pending: false,
        pendingLabel: undefined,
        confirmVariant: "default",
    },
)

const emit = defineEmits<{
    "update:open": [value: boolean]
    confirm: []
}>()
</script>

<template>
    <AlertDialog
        :open="open"
        @update:open="(value) => emit('update:open', value)"
    >
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{{ title }}</AlertDialogTitle>
                <AlertDialogDescription>{{ description }}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <Button
                    type="button"
                    variant="outline"
                    :disabled="pending"
                    @click="emit('update:open', false)"
                >
                    {{ cancelLabel }}
                </Button>
                <Button
                    type="button"
                    :variant="confirmVariant"
                    :disabled="pending"
                    @click="emit('confirm')"
                >
                    {{ pending && pendingLabel ? pendingLabel : confirmLabel }}
                </Button>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
