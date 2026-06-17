<script setup lang="ts">
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { getMemberLabel } from "@/composables/useMembersAdministration"
import type { OrganizationMember } from "@/types/organization-member.type"

defineProps<{
    open: boolean
    member: OrganizationMember | null
    saving: boolean
}>()

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
                <AlertDialogTitle>Remove member</AlertDialogTitle>
                <AlertDialogDescription>
                    This removes {{ member ? getMemberLabel(member) : "the selected member" }} from the active
                    organization.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <Separator />
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                    :disabled="saving"
                    @click="emit('confirm')"
                >
                    Remove
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
