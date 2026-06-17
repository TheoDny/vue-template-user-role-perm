<script setup lang="ts">
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

defineProps<{
    createOpen: boolean
    renameOpen: boolean
    deleteOpen: boolean
    createRoleName: string
    roleNameDraft: string
    saving: boolean
}>()

const emit = defineEmits<{
    "update:createOpen": [value: boolean]
    "update:renameOpen": [value: boolean]
    "update:deleteOpen": [value: boolean]
    "update:createRoleName": [value: string]
    "update:roleNameDraft": [value: string]
    create: []
    rename: []
    delete: []
}>()
</script>

<template>
    <Dialog
        :open="createOpen"
        @update:open="(value) => emit('update:createOpen', value)"
    >
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create role</DialogTitle>
                <DialogDescription
                    >New roles start without permissions. Add permissions after creation.</DialogDescription
                >
            </DialogHeader>
            <FieldGroup>
                <Field>
                    <FieldLabel for="create-role-name">Role name</FieldLabel>
                    <Input
                        id="create-role-name"
                        :model-value="createRoleName"
                        @update:model-value="(value) => emit('update:createRoleName', String(value))"
                    />
                </Field>
            </FieldGroup>
            <DialogFooter>
                <Button
                    variant="outline"
                    @click="emit('update:createOpen', false)"
                >
                    Cancel
                </Button>
                <Button
                    :disabled="!createRoleName.trim() || saving"
                    @click="emit('create')"
                >
                    Create
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <Dialog
        :open="renameOpen"
        @update:open="(value) => emit('update:renameOpen', value)"
    >
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Rename role</DialogTitle>
                <DialogDescription>Update the role display name for this organization.</DialogDescription>
            </DialogHeader>
            <FieldGroup>
                <Field>
                    <FieldLabel for="rename-role-name">Role name</FieldLabel>
                    <Input
                        id="rename-role-name"
                        :model-value="roleNameDraft"
                        @update:model-value="(value) => emit('update:roleNameDraft', String(value))"
                    />
                </Field>
            </FieldGroup>
            <DialogFooter>
                <Button
                    variant="outline"
                    @click="emit('update:renameOpen', false)"
                >
                    Cancel
                </Button>
                <Button
                    :disabled="!roleNameDraft.trim() || saving"
                    @click="emit('rename')"
                >
                    Save
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    <ConfirmDialog
        :open="deleteOpen"
        title="Delete role"
        description="This action cannot be undone. Roles assigned to members cannot be deleted."
        confirm-label="Delete"
        pending-label="Deleting..."
        :pending="saving"
        @update:open="(value) => emit('update:deleteOpen', value)"
        @confirm="emit('delete')"
    />
</template>
