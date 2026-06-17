<script setup lang="ts">
import type { BadgeVariants } from "@/components/ui/badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { parseRoleList } from "@/lib/roles"
import { cn } from "@/lib/utils"
import type { OrganizationInvitation } from "@/types/organization-invitation.type"
import { Mail, X, XCircle } from "@lucide/vue"
import { computed } from "vue"

const props = defineProps<{
  invitations: OrganizationInvitation[]
  selectedInvitationId: string | null
  search: string
  loading: boolean
  canCancel: boolean
  canResend: boolean
}>()

const emit = defineEmits<{
  "update:search": [value: string]
  select: [invitationId: string]
  cancel: [invitation: OrganizationInvitation]
  resend: [invitationId: string]
}>()

const filteredInvitations = computed(() => {
  const search = props.search.trim().toLowerCase()

  if (!search) {
    return props.invitations
  }

  return props.invitations.filter((invitation) => {
    const roles = parseRoleList(invitation.role).join(" ").toLowerCase()

    return invitation.email.toLowerCase().includes(search) ||
      invitation.status.toLowerCase().includes(search) ||
      roles.includes(search)
  })
})

function statusVariant(status: string): BadgeVariants["variant"] {
  if (status === "pending") {
    return "default"
  }

  if (["canceled", "expired", "rejected"].includes(status)) {
    return "destructive"
  }

  return "secondary"
}

function getInvitationButtonClass(invitation: OrganizationInvitation): string {
  const isActive = invitation.id === props.selectedInvitationId

  return cn(
    "group flex min-w-0 flex-1 items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted",
    isActive && "border-primary bg-primary/5 shadow-sm",
  )
}

function clearSearch() {
  emit("update:search", "")
}

function handleCancel(invitation: OrganizationInvitation) {
  emit("select", invitation.id)
  emit("cancel", invitation)
}

function handleResend(invitation: OrganizationInvitation) {
  emit("select", invitation.id)
  emit("resend", invitation.id)
}
</script>

<template>
  <Card class="min-h-0" size="sm">
    <CardHeader>
      <CardTitle>Invitation list</CardTitle>
      <CardDescription>{{ invitations.length }} invitations in this organization</CardDescription>
      <CardAction>
        <Badge variant="outline">{{ filteredInvitations.length }}</Badge>
      </CardAction>
    </CardHeader>
    <CardContent class="flex flex-1 min-h-0 flex-col gap-3">
      <div class="flex gap-2">
        <Input
          :model-value="search"
          placeholder="Search invitations..."
          aria-label="Search invitations"
          @update:model-value="(value) => emit('update:search', String(value))"
        />
        <Button
          variant="outline"
          size="icon"
          :disabled="!search"
          aria-label="Clear invitation search"
          @click="clearSearch"
        >
          <X />
        </Button>
      </div>

      <div class="flex h-full min-h-0 flex-col gap-2 overflow-auto pr-1">
        <template v-if="loading">
          <Skeleton
            v-for="index in 5"
            :key="index"
            class="h-16 rounded-lg"
          />
        </template>
        <template v-else-if="filteredInvitations.length">
          <div
            v-for="invitation in filteredInvitations"
            :key="invitation.id"
            class="flex gap-2"
          >
            <button
              type="button"
              :class="getInvitationButtonClass(invitation)"
              :data-active="invitation.id === selectedInvitationId || undefined"
              @click="emit('select', invitation.id)"
            >
              <Mail :class="invitation.id === selectedInvitationId ? 'text-primary' : 'text-muted-foreground'" />
              <span class="flex min-w-0 flex-1 flex-col gap-1">
                <span class="block truncate text-sm font-medium">{{ invitation.email }}</span>
                <span class="block truncate text-xs text-muted-foreground">
                  {{ parseRoleList(invitation.role).join(", ") || "No role" }}
                </span>
              </span>
              <Badge :variant="statusVariant(invitation.status)">
                {{ invitation.status }}
              </Badge>
              <div class="flex shrink-0 gap-1">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      variant="outline"
                      size="icon"
                      :disabled="!canResend || invitation.status !== 'pending'"
                      @click="handleResend(invitation)"
                    >
                      <Mail />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Resend invitation</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      variant="destructive"
                      size="icon"
                      :disabled="!canCancel || invitation.status !== 'pending'"
                      @click="handleCancel(invitation)"
                    >
                      <XCircle />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Cancel invitation</TooltipContent>
                </Tooltip>
              </div>
            </button>
          </div>
        </template>
        <div
          v-else
          class="flex h-full min-h-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground"
        >
          <Mail />
          <span>No invitations found.</span>
          <Button
            v-if="search"
            variant="outline"
            size="sm"
            @click="clearSearch"
          >
            Clear search
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>
