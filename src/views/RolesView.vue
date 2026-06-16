<script setup lang="ts">
import { Pencil, Plus, Save, Trash2 } from "@lucide/vue"
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
import {
  getRoleKey,
  getRoleLabel,
  isStaticRole,
  useRolesAdministration,
} from "@/composables/useRolesAdministration"
import { useSessionStore } from "@/stores/session.store"
import type { OrganizationRole } from "@/types/organization-role.type"
import type { PermissionMatrix } from "@/types/permission.type"

const sessionStore = useSessionStore()
const rolesAdmin = useRolesAdministration()
const draftPermissions = ref<PermissionMatrix>({})
const createDialogOpen = ref(false)
const renameDialogOpen = ref(false)
const deleteDialogOpen = ref(false)
const roleNameDraft = ref("")
const createRoleName = ref("")

const selectedRole = computed(() => rolesAdmin.selectedRole.value)
const permissionResources = computed(() => rolesAdmin.permissionCatalog.value?.resources ?? {})
const canCreate = computed(() => sessionStore.hasPermission("ac:create"))
const canUpdate = computed(() => sessionStore.hasPermission("ac:update"))
const canDelete = computed(() => sessionStore.hasPermission("ac:delete"))
const canSave = computed(() => Boolean(selectedRole.value && canUpdate.value && hasPermissionChanges.value))

const hasPermissionChanges = computed(
  () => JSON.stringify(normalizePermissionOrder(draftPermissions.value)) !==
    JSON.stringify(normalizePermissionOrder(rolesAdmin.selectedPermissions.value)),
)

watch(
  () => selectedRole.value,
  () => {
    draftPermissions.value = clonePermissions(rolesAdmin.selectedPermissions.value)
  },
)

onMounted(async () => {
  await rolesAdmin.refresh()
  draftPermissions.value = clonePermissions(rolesAdmin.selectedPermissions.value)
})

watch(
  () => sessionStore.activeOrganizationId,
  async () => {
    await rolesAdmin.refresh()
    draftPermissions.value = clonePermissions(rolesAdmin.selectedPermissions.value)
  },
)

function clonePermissions(permissions: PermissionMatrix): PermissionMatrix {
  return Object.fromEntries(
    Object.entries(permissions).map(([resource, actions]) => [resource, [...new Set(actions)]]),
  )
}

function normalizePermissionOrder(permissions: PermissionMatrix): PermissionMatrix {
  return Object.fromEntries(
    Object.entries(permissions)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([resource, actions]) => [resource, [...actions].sort()]),
  )
}

function isPermissionChecked(resource: string, action: string): boolean {
  return draftPermissions.value[resource]?.includes(action) ?? false
}

function togglePermission(resource: string, action: string, checked: boolean | "indeterminate") {
  const currentActions = new Set(draftPermissions.value[resource] ?? [])

  if (checked === true) {
    currentActions.add(action)
  } else {
    currentActions.delete(action)
  }

  draftPermissions.value = {
    ...draftPermissions.value,
    [resource]: [...currentActions],
  }
}

function selectRole(role: OrganizationRole) {
  rolesAdmin.selectedRoleKey.value = getRoleKey(role)
}

function openRenameDialog() {
  if (!selectedRole.value) {
    return
  }

  roleNameDraft.value = getRoleLabel(selectedRole.value)
  renameDialogOpen.value = true
}

async function handleCreateRole() {
  const role = createRoleName.value.trim()

  if (!role) {
    return
  }

  await rolesAdmin.create({ role, permissions: {} })
  createRoleName.value = ""
  createDialogOpen.value = false
}

async function handleRenameRole() {
  if (!selectedRole.value) {
    return
  }

  await rolesAdmin.rename(selectedRole.value, roleNameDraft.value.trim())
  renameDialogOpen.value = false
}

async function handleSavePermissions() {
  if (!selectedRole.value) {
    return
  }

  await rolesAdmin.updatePermissions(selectedRole.value, draftPermissions.value)
}

async function handleDeleteRole() {
  if (!selectedRole.value) {
    return
  }

  await rolesAdmin.remove(selectedRole.value)
  deleteDialogOpen.value = false
}
</script>

<template>
  <section class="flex h-[calc(100svh-3.5rem)] flex-col gap-4 p-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-semibold tracking-normal">Roles</h1>
        <p class="text-sm text-muted-foreground">Manage organization roles and permission sets.</p>
      </div>
      <Button
        :disabled="!canCreate"
        @click="createDialogOpen = true"
      >
        <Plus data-icon="inline-start" />
        Create role
      </Button>
    </div>

    <div class="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(16rem,22rem)_1fr]">
      <Card class="min-h-0">
        <CardHeader>
          <CardTitle>Role list</CardTitle>
        </CardHeader>
        <CardContent class="flex min-h-0 flex-col gap-2 overflow-auto">
          <template v-if="rolesAdmin.loading.value">
            <Skeleton
              v-for="index in 5"
              :key="index"
              class="h-12"
            />
          </template>
          <template v-else-if="rolesAdmin.roles.value.length">
            <button
              v-for="role in rolesAdmin.roles.value"
              :key="getRoleKey(role)"
              type="button"
              class="flex w-full items-center justify-between gap-2 rounded-md border p-3 text-left text-sm hover:bg-muted"
              :data-active="getRoleKey(role) === rolesAdmin.selectedRoleKey.value || undefined"
              @click="selectRole(role)"
            >
              <span class="min-w-0 truncate font-medium">{{ getRoleLabel(role) }}</span>
              <Badge
                v-if="isStaticRole(role)"
                variant="secondary"
              >
                Static
              </Badge>
            </button>
          </template>
          <div
            v-else
            class="rounded-md border p-4 text-sm text-muted-foreground"
          >
            No roles found.
          </div>
        </CardContent>
      </Card>

      <Card class="min-h-0">
        <CardHeader class="flex flex-row items-start justify-between gap-3">
          <div class="min-w-0">
            <CardTitle>{{ selectedRole ? getRoleLabel(selectedRole) : "Permissions" }}</CardTitle>
            <p class="text-sm text-muted-foreground">Select permissions, then save changes.</p>
          </div>
          <div class="flex shrink-0 gap-2">
            <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="outline"
                  size="icon"
                  :disabled="!selectedRole || !canUpdate"
                  @click="openRenameDialog"
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
                  :disabled="!selectedRole || selectedRole.role === 'owner' || !canDelete"
                  @click="deleteDialogOpen = true"
                >
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete role</TooltipContent>
            </Tooltip>
            <Button
              :disabled="!canSave || rolesAdmin.saving.value"
              @click="handleSavePermissions"
            >
              <Save data-icon="inline-start" />
              Save
            </Button>
          </div>
        </CardHeader>
        <CardContent class="min-h-0 overflow-auto">
          <div
            v-if="selectedRole"
            class="flex flex-col gap-5"
          >
            <FieldGroup>
              <FieldSet
                v-for="(actions, resource) in permissionResources"
                :key="resource"
                class="gap-3"
              >
                <FieldLegend class="capitalize">{{ resource }}</FieldLegend>
                <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Field
                    v-for="action in actions"
                    :key="`${resource}:${action}`"
                    orientation="horizontal"
                    class="items-center gap-2 rounded-md border p-3"
                  >
                    <Checkbox
                      :model-value="isPermissionChecked(String(resource), action)"
                      :disabled="!canUpdate"
                      @update:model-value="(value) => togglePermission(String(resource), action, value)"
                    />
                    <FieldLabel class="capitalize">{{ action }}</FieldLabel>
                  </Field>
                </div>
              </FieldSet>
            </FieldGroup>
          </div>
          <div
            v-else
            class="rounded-md border p-4 text-sm text-muted-foreground"
          >
            Select a role to edit permissions.
          </div>
        </CardContent>
      </Card>
    </div>

    <Dialog v-model:open="createDialogOpen">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create role</DialogTitle>
          <DialogDescription>New roles start without permissions. Add permissions after creation.</DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <FieldLabel for="create-role-name">Role name</FieldLabel>
            <Input
              id="create-role-name"
              v-model="createRoleName"
            />
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
            :disabled="!createRoleName.trim() || rolesAdmin.saving.value"
            @click="handleCreateRole"
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="renameDialogOpen">
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
              v-model="roleNameDraft"
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button
            variant="outline"
            @click="renameDialogOpen = false"
          >
            Cancel
          </Button>
          <Button
            :disabled="!roleNameDraft.trim() || rolesAdmin.saving.value"
            @click="handleRenameRole"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete role</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Roles assigned to members cannot be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Separator />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            :disabled="rolesAdmin.saving.value"
            @click="handleDeleteRole"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>
</template>
