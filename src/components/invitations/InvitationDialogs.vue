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
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import type { OrganizationInvitation } from "@/types/organization-invitation.type"

defineProps<{
  createOpen: boolean
  cancelOpen: boolean
  createEmail: string
  createRoles: string[]
  roleOptions: string[]
  canSubmitCreate: boolean
  saving: boolean
  invitationToCancel: OrganizationInvitation | null
}>()

const emit = defineEmits<{
  "update:createOpen": [value: boolean]
  "update:cancelOpen": [value: boolean]
  "update:createEmail": [value: string]
  toggleCreateRole: [role: string]
  create: []
  cancel: []
}>()

function formatRole(role: string): string {
  return role.replace(/[-_]/g, " ")
}
</script>

<template>
  <Dialog
    :open="createOpen"
    @update:open="(value) => emit('update:createOpen', value)"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create invitation</DialogTitle>
        <DialogDescription>Choose the email and roles to send with the invitation.</DialogDescription>
      </DialogHeader>
      <FieldGroup>
        <Field>
          <FieldLabel for="invitation-email">Email</FieldLabel>
          <Input
            id="invitation-email"
            type="email"
            :model-value="createEmail"
            @update:model-value="(value) => emit('update:createEmail', String(value))"
          />
        </Field>
        <FieldSet class="gap-3">
          <FieldLegend>Roles</FieldLegend>
          <div class="grid gap-2 sm:grid-cols-2">
            <Field
              v-for="role in roleOptions"
              :key="role"
              orientation="horizontal"
              class="cursor-pointer items-center gap-2 rounded-lg border bg-background p-3 transition-colors has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5"
              @click="emit('toggleCreateRole', role)"
            >
              <Checkbox
                :model-value="createRoles.includes(role)"
                @click.stop
                @update:model-value="emit('toggleCreateRole', role)"
              />
              <FieldLabel class="pointer-events-none capitalize">{{ formatRole(role) }}</FieldLabel>
            </Field>
          </div>
        </FieldSet>
      </FieldGroup>
      <DialogFooter>
        <Button
          variant="outline"
          @click="emit('update:createOpen', false)"
        >
          Cancel
        </Button>
        <Button
          :disabled="!canSubmitCreate || saving"
          @click="emit('create')"
        >
          Invite
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <AlertDialog
    :open="cancelOpen"
    @update:open="(value) => emit('update:cancelOpen', value)"
  >
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Cancel invitation</AlertDialogTitle>
        <AlertDialogDescription>
          This prevents {{ invitationToCancel?.email ?? "the recipient" }} from accepting the selected invitation.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <Separator />
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction
          :disabled="saving"
          @click="emit('cancel')"
        >
          Cancel invitation
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
