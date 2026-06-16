<script setup lang="ts">
import { MailPlus, Save, XCircle } from "@lucide/vue"
import { computed, onMounted, ref, watch } from "vue"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useInvitationsAdministration } from "@/composables/useInvitationsAdministration"
import { parseRoleList, toUniqueRoles } from "@/lib/roles"
import { useSessionStore } from "@/stores/session.store"

const sessionStore = useSessionStore()
const invitationsAdmin = useInvitationsAdministration()
const roleDraft = ref<string[]>([])
const createDialogOpen = ref(false)
const cancelDialogOpen = ref(false)
const createEmail = ref("")
const createRoles = ref<string[]>([])
const resend = ref(false)

const selectedInvitation = computed(() => invitationsAdmin.selectedInvitation.value)
const canCreate = computed(() => sessionStore.hasPermission("invitation:create"))
const canUpdate = computed(() => sessionStore.hasPermission("invitation:update"))
const canCancel = computed(() => sessionStore.hasPermission("invitation:cancel"))
const isPending = computed(() => selectedInvitation.value?.status === "pending")
const hasChanges = computed(
  () => JSON.stringify([...roleDraft.value].sort()) !==
    JSON.stringify([...invitationsAdmin.selectedInvitationRoles.value].sort()),
)
const canSave = computed(() =>
  Boolean(selectedInvitation.value && isPending.value && canUpdate.value && roleDraft.value.length > 0 && hasChanges.value),
)
const canSubmitCreate = computed(() => createEmail.value.includes("@") && createRoles.value.length > 0 && canCreate.value)

watch(
  () => selectedInvitation.value,
  () => {
    roleDraft.value = [...invitationsAdmin.selectedInvitationRoles.value]
  },
)

onMounted(async () => {
  await invitationsAdmin.refresh()
  roleDraft.value = [...invitationsAdmin.selectedInvitationRoles.value]
})

watch(
  () => sessionStore.activeOrganizationId,
  async () => {
    await invitationsAdmin.refresh()
    roleDraft.value = [...invitationsAdmin.selectedInvitationRoles.value]
  },
)

function selectInvitation(invitationId: string) {
  invitationsAdmin.selectedInvitationId.value = invitationId
}

function hasRole(role: string): boolean {
  return roleDraft.value.includes(role)
}

function hasCreateRole(role: string): boolean {
  return createRoles.value.includes(role)
}

function toggleRole(role: string, checked: boolean | "indeterminate") {
  const roles = new Set(roleDraft.value)

  if (checked === true) {
    roles.add(role)
  } else {
    roles.delete(role)
  }

  roleDraft.value = toUniqueRoles([...roles])
}

function toggleCreateRole(role: string, checked: boolean | "indeterminate") {
  const roles = new Set(createRoles.value)

  if (checked === true) {
    roles.add(role)
  } else {
    roles.delete(role)
  }

  createRoles.value = toUniqueRoles([...roles])
}

function statusVariant(status: string) {
  return status === "pending" ? "default" : "secondary"
}

async function handleCreateInvitation() {
  await invitationsAdmin.create({
    email: createEmail.value.trim(),
    roles: createRoles.value,
    resend: resend.value,
  })
  createEmail.value = ""
  createRoles.value = []
  resend.value = false
  createDialogOpen.value = false
}

async function handleSaveRoles() {
  if (!selectedInvitation.value) {
    return
  }

  await invitationsAdmin.updateRoles(selectedInvitation.value, roleDraft.value)
}

async function handleCancelInvitation() {
  if (!selectedInvitation.value) {
    return
  }

  await invitationsAdmin.cancel(selectedInvitation.value)
  cancelDialogOpen.value = false
}
</script>

<template>
  <section class="flex h-[calc(100svh-3.5rem)] flex-col gap-4 p-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-semibold tracking-normal">Invitations</h1>
        <p class="text-sm text-muted-foreground">Invite users and adjust pending invitation roles.</p>
      </div>
      <div class="flex gap-2">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="destructive"
              size="icon"
              :disabled="!selectedInvitation || !canCancel || !isPending"
              @click="cancelDialogOpen = true"
            >
              <XCircle />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cancel invitation</TooltipContent>
        </Tooltip>
        <Button
          :disabled="!canSave || invitationsAdmin.saving.value"
          @click="handleSaveRoles"
        >
          <Save data-icon="inline-start" />
          Save roles
        </Button>
        <Button
          :disabled="!canCreate"
          @click="createDialogOpen = true"
        >
          <MailPlus data-icon="inline-start" />
          Invite
        </Button>
      </div>
    </div>

    <div class="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(18rem,24rem)_1fr]">
      <Card class="min-h-0">
        <CardHeader>
          <CardTitle>Invitation list</CardTitle>
        </CardHeader>
        <CardContent class="flex min-h-0 flex-col gap-2 overflow-auto">
          <template v-if="invitationsAdmin.loading.value">
            <Skeleton
              v-for="index in 5"
              :key="index"
              class="h-14"
            />
          </template>
          <template v-else-if="invitationsAdmin.invitations.value.length">
            <button
              v-for="invitation in invitationsAdmin.invitations.value"
              :key="invitation.id"
              type="button"
              class="flex w-full items-center justify-between gap-3 rounded-md border p-3 text-left hover:bg-muted"
              :data-active="invitation.id === invitationsAdmin.selectedInvitationId.value || undefined"
              @click="selectInvitation(invitation.id)"
            >
              <div class="min-w-0">
                <p class="truncate text-sm font-medium">{{ invitation.email }}</p>
                <p class="truncate text-xs text-muted-foreground">
                  {{ parseRoleList(invitation.role).join(", ") || "No role" }}
                </p>
              </div>
              <Badge :variant="statusVariant(invitation.status)">
                {{ invitation.status }}
              </Badge>
            </button>
          </template>
          <div
            v-else
            class="rounded-md border p-4 text-sm text-muted-foreground"
          >
            No invitations found.
          </div>
        </CardContent>
      </Card>

      <Card class="min-h-0">
        <CardHeader>
          <CardTitle>{{ selectedInvitation?.email ?? "Invitation roles" }}</CardTitle>
          <p class="text-sm text-muted-foreground">Only pending invitations can be updated.</p>
        </CardHeader>
        <CardContent class="min-h-0 overflow-auto">
          <FieldGroup v-if="selectedInvitation">
            <FieldSet>
              <FieldLegend>Roles</FieldLegend>
              <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Field
                  v-for="role in invitationsAdmin.roleOptions.value"
                  :key="role"
                  orientation="horizontal"
                  class="items-center gap-2 rounded-md border p-3"
                >
                  <Checkbox
                    :model-value="hasRole(role)"
                    :disabled="!canUpdate || !isPending"
                    @update:model-value="(value) => toggleRole(role, value)"
                  />
                  <FieldLabel>{{ role }}</FieldLabel>
                </Field>
              </div>
            </FieldSet>
          </FieldGroup>
          <div
            v-else
            class="rounded-md border p-4 text-sm text-muted-foreground"
          >
            Select an invitation to edit roles.
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog v-model:open="createDialogOpen">
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
              v-model="createEmail"
              type="email"
            />
          </Field>
          <FieldSet>
            <FieldLegend>Roles</FieldLegend>
            <div class="grid gap-3 sm:grid-cols-2">
              <Field
                v-for="role in invitationsAdmin.roleOptions.value"
                :key="role"
                orientation="horizontal"
                class="items-center gap-2 rounded-md border p-3"
              >
                <Checkbox
                  :model-value="hasCreateRole(role)"
                  @update:model-value="(value) => toggleCreateRole(role, value)"
                />
                <FieldLabel>{{ role }}</FieldLabel>
              </Field>
            </div>
          </FieldSet>
          <Field
            orientation="horizontal"
            class="items-center gap-2"
          >
            <Checkbox v-model="resend" />
            <FieldLabel>Resend if an invitation already exists</FieldLabel>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button
            variant="outline"
            @click="createDialogOpen = false"
          >
            Cancel
          </Button>
          <Button
            :disabled="!canSubmitCreate || invitationsAdmin.saving.value"
            @click="handleCreateInvitation"
          >
            Invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="cancelDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel invitation</AlertDialogTitle>
          <AlertDialogDescription>
            This prevents the recipient from accepting the selected invitation.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Separator />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            :disabled="invitationsAdmin.saving.value"
            @click="handleCancelInvitation"
          >
            Cancel invitation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>
</template>
