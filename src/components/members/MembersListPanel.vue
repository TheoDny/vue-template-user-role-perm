<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { getMemberLabel } from "@/composables/useMembersAdministration"
import { parseRoleList } from "@/lib/roles"
import { cn } from "@/lib/utils"
import type { OrganizationMember } from "@/types/organization-member.type"
import { RefreshCw, Trash2, UserCircle, X } from "@lucide/vue"
import { computed } from "vue"

const props = defineProps<{
  members: OrganizationMember[]
  selectedMemberId: string | null
  search: string
  loading: boolean
  canDelete: boolean
  currentUserId?: string
}>()

const emit = defineEmits<{
  "update:search": [value: string]
  select: [memberId: string]
  remove: [member: OrganizationMember]
  refresh: []
}>()

const filteredMembers = computed(() => {
  const search = props.search.trim().toLowerCase()

  if (!search) {
    return props.members
  }

  return props.members.filter((member) => {
    const label = getMemberLabel(member).toLowerCase()
    const email = member.user?.email?.toLowerCase() ?? ""
    const roles = parseRoleList(member.role).join(" ").toLowerCase()

    return label.includes(search) || email.includes(search) || roles.includes(search)
  })
})

function getMemberButtonClass(member: OrganizationMember): string {
  const isActive = member.id === props.selectedMemberId

  return cn(
    "group flex min-w-0 flex-1 items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-muted",
    isActive && "border-primary bg-primary/5 shadow-sm",
  )
}

function getMemberFallback(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean)

  if (parts.length > 1) {
    return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
  }

  return label.charAt(0).toUpperCase()
}

function isSelf(member: OrganizationMember): boolean {
  return Boolean(member.userId && member.userId === props.currentUserId)
}

function clearSearch() {
  emit("update:search", "")
}
</script>

<template>
  <Card class="min-h-0" size="sm">
    <CardHeader>
      <CardTitle>Member list</CardTitle>
      <CardDescription>{{ members.length }} members in this organization</CardDescription>
      <CardAction>
        <div class="flex flex-wrap justify-end gap-2">
          <Tooltip>
            <TooltipTrigger as-child>
              <Button
                variant="outline"
                size="icon"
                :disabled="loading"
                aria-label="Refresh members"
                @click="emit('refresh')"
              >
                <RefreshCw />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh members</TooltipContent>
          </Tooltip>
        </div>
      </CardAction>
    </CardHeader>
    <CardContent class="flex flex-1 min-h-0 flex-col gap-3">
      <div class="flex gap-2">
        <Input
          :model-value="search"
          placeholder="Search members..."
          aria-label="Search members"
          @update:model-value="(value) => emit('update:search', String(value))"
        />
        <Button
          variant="outline"
          size="icon"
          :disabled="!search"
          aria-label="Clear member search"
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
        <template v-else-if="filteredMembers.length">
          <div
            v-for="member in filteredMembers"
            :key="member.id"
            class="flex gap-2"
          >
            <button
              type="button"
              :class="getMemberButtonClass(member)"
              :data-active="member.id === selectedMemberId || undefined"
              @click="emit('select', member.id)"
            >
              <Avatar>
                <AvatarImage
                  :src="member.user?.image ?? ''"
                  :alt="getMemberLabel(member)"
                />
                <AvatarFallback>{{ getMemberFallback(getMemberLabel(member)) }}</AvatarFallback>
              </Avatar>
              <span class="flex min-w-0 flex-1 flex-col gap-1">
                <span class="truncate text-sm font-medium">{{ getMemberLabel(member) }}</span>
                <span class="truncate text-xs text-muted-foreground">{{ member.user?.email ?? member.userId }}</span>
              </span>
              <span class="flex shrink-0 items-center gap-1">
                <Badge
                  v-if="isSelf(member)"
                  variant="secondary"
                >
                  You
                </Badge>
                <Badge variant="outline">{{ parseRoleList(member.role).length }}</Badge>
              </span>
              <Tooltip>
              <TooltipTrigger as-child>
                <Button
                  variant="destructive"
                  size="icon"
                  :disabled="!canDelete || isSelf(member)"
                  @click="emit('remove', member)"
                >
                  <Trash2 />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove member</TooltipContent>
            </Tooltip>
            </button>
          </div>
        </template>
        <div
          v-else
          class="flex h-full min-h-36 flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground"
        >
          <UserCircle />
          <span>No members found.</span>
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
