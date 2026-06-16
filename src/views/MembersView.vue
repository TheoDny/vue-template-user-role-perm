<script setup lang="ts">
import { Save, Trash2 } from "@lucide/vue"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getMemberLabel, useMembersAdministration } from "@/composables/useMembersAdministration"
import { parseRoleList, toUniqueRoles } from "@/lib/roles"
import { useSessionStore } from "@/stores/session.store"

const sessionStore = useSessionStore()
const membersAdmin = useMembersAdministration()
const roleDraft = ref<string[]>([])
const deleteDialogOpen = ref(false)

const selectedMember = computed(() => membersAdmin.selectedMember.value)
const canUpdate = computed(() => sessionStore.hasPermission("member:update"))
const canDelete = computed(() => sessionStore.hasPermission("member:delete"))
const isSelf = computed(() => selectedMember.value?.userId === sessionStore.user?.id)
const hasChanges = computed(
  () => JSON.stringify([...roleDraft.value].sort()) !==
    JSON.stringify([...membersAdmin.selectedMemberRoles.value].sort()),
)
const canSave = computed(() => Boolean(selectedMember.value && canUpdate.value && roleDraft.value.length > 0 && hasChanges.value))

watch(
  () => selectedMember.value,
  () => {
    roleDraft.value = [...membersAdmin.selectedMemberRoles.value]
  },
)

onMounted(async () => {
  await membersAdmin.refresh()
  roleDraft.value = [...membersAdmin.selectedMemberRoles.value]
})

function selectMember(memberId: string) {
  membersAdmin.selectedMemberId.value = memberId
}

function memberFallback(label: string): string {
  return label.charAt(0).toUpperCase()
}

function hasRole(role: string): boolean {
  return roleDraft.value.includes(role)
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

async function handleSaveRoles() {
  if (!selectedMember.value) {
    return
  }

  await membersAdmin.updateRoles(selectedMember.value, roleDraft.value)
}

async function handleRemoveMember() {
  if (!selectedMember.value) {
    return
  }

  await membersAdmin.remove(selectedMember.value)
  deleteDialogOpen.value = false
}
</script>

<template>
  <section class="flex h-[calc(100svh-3.5rem)] flex-col gap-4 p-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-semibold tracking-normal">Members</h1>
        <p class="text-sm text-muted-foreground">Assign organization roles to members.</p>
      </div>
      <div class="flex gap-2">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button
              variant="destructive"
              size="icon"
              :disabled="!selectedMember || !canDelete || isSelf"
              @click="deleteDialogOpen = true"
            >
              <Trash2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Remove member</TooltipContent>
        </Tooltip>
        <Button
          :disabled="!canSave || membersAdmin.saving.value"
          @click="handleSaveRoles"
        >
          <Save data-icon="inline-start" />
          Save roles
        </Button>
      </div>
    </div>

    <div class="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(18rem,24rem)_1fr]">
      <Card class="min-h-0">
        <CardHeader>
          <CardTitle>Member list</CardTitle>
        </CardHeader>
        <CardContent class="flex min-h-0 flex-col gap-2 overflow-auto">
          <template v-if="membersAdmin.loading.value">
            <Skeleton
              v-for="index in 5"
              :key="index"
              class="h-14"
            />
          </template>
          <template v-else-if="membersAdmin.members.value.length">
            <button
              v-for="member in membersAdmin.members.value"
              :key="member.id"
              type="button"
              class="flex w-full items-center gap-3 rounded-md border p-3 text-left hover:bg-muted"
              :data-active="member.id === membersAdmin.selectedMemberId.value || undefined"
              @click="selectMember(member.id)"
            >
              <Avatar>
                <AvatarImage
                  :src="member.user?.image ?? ''"
                  :alt="getMemberLabel(member)"
                />
                <AvatarFallback>{{ memberFallback(getMemberLabel(member)) }}</AvatarFallback>
              </Avatar>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium">{{ getMemberLabel(member) }}</p>
                <p class="truncate text-xs text-muted-foreground">{{ member.user?.email ?? member.userId }}</p>
              </div>
              <Badge variant="secondary">{{ parseRoleList(member.role).length }}</Badge>
            </button>
          </template>
          <div
            v-else
            class="rounded-md border p-4 text-sm text-muted-foreground"
          >
            No members found.
          </div>
        </CardContent>
      </Card>

      <Card class="min-h-0">
        <CardHeader>
          <CardTitle>{{ selectedMember ? getMemberLabel(selectedMember) : "Assignable roles" }}</CardTitle>
          <p class="text-sm text-muted-foreground">Select one or more roles, then save.</p>
        </CardHeader>
        <CardContent class="min-h-0 overflow-auto">
          <FieldGroup v-if="selectedMember">
            <FieldSet>
              <FieldLegend>Roles</FieldLegend>
              <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <Field
                  v-for="role in membersAdmin.roleOptions.value"
                  :key="role"
                  orientation="horizontal"
                  class="items-center gap-2 rounded-md border p-3"
                >
                  <Checkbox
                    :model-value="hasRole(role)"
                    :disabled="!canUpdate"
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
            Select a member to assign roles.
          </div>
        </CardContent>
      </Card>
    </div>

    <AlertDialog v-model:open="deleteDialogOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove member</AlertDialogTitle>
          <AlertDialogDescription>
            This removes the selected member from the active organization.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Separator />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            :disabled="membersAdmin.saving.value"
            @click="handleRemoveMember"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </section>
</template>
