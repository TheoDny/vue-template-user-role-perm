<script setup lang="ts">
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { toast } from "vue-sonner"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { isApiError } from "@/services/api.service"
import { getFirstAllowedAdministrationRouteName } from "@/lib/admin-navigation"
import { useSessionStore } from "@/stores/session.store"

const sessionStore = useSessionStore()
const route = useRoute()
const router = useRouter()
const pending = ref(false)

const selectedOrganizationId = computed({
  get: () => sessionStore.activeOrganizationId ?? undefined,
  set: (organizationId) => {
    if (!organizationId || organizationId === sessionStore.activeOrganizationId) {
      return
    }

    void handleOrganizationChange(organizationId)
  },
})

async function handleOrganizationChange(organizationId: string) {
  pending.value = true

  try {
    await sessionStore.setActiveOrganization(organizationId)
    const routePermission = route.meta.permission

    if (routePermission && !sessionStore.hasPermission(routePermission)) {
      await router.replace({ name: getFirstAllowedAdministrationRouteName(sessionStore.hasPermission) })
    }
  } catch (error) {
    toast.error(isApiError(error) ? error.message : "Unable to switch organization")
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <Select
    v-model="selectedOrganizationId"
    :disabled="pending || sessionStore.organizations.length === 0"
  >
    <SelectTrigger class="w-full">
      <SelectValue placeholder="Select organization" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectItem
          v-for="organization in sessionStore.organizations"
          :key="organization.id"
          :value="organization.id"
        >
          {{ organization.name }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
