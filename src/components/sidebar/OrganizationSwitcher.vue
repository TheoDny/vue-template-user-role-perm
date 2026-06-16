<script setup lang="ts">
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getFirstAllowedAdministrationRouteName } from "@/lib/admin-navigation"
import { isApiError } from "@/services/api.service"
import { useSessionStore } from "@/stores/session.store"
import { Building2 } from "@lucide/vue"
import { computed, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { toast } from "vue-sonner"

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

defineProps<{
    small: boolean
}>()
</script>

<template>
    <Select
        v-model="selectedOrganizationId"
        :disabled="pending || sessionStore.organizations.length === 0"
    >
        <SelectTrigger
            class="w-full min-w-[38px]"
            :chevron="false"
        >
            <span class="flex flex-row items-center gap-1 w-full">
                <Building2 class="size-4" />
                <SelectValue
                    placeholder="Select organization"
                    class="flex-1 text-center truncate"
                />
            </span>
        </SelectTrigger>
        <SelectContent class="w-full">
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
