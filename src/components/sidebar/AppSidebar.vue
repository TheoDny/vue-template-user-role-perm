<script setup lang="ts">
import NavUser from "@/components/sidebar/NavUser.vue"
import OrganizationSwitcher from "@/components/sidebar/OrganizationSwitcher.vue"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { getVisibleAdministrationItems } from "@/lib/admin-navigation"
import { APP_NAME } from "@/lib/env.ts"
import { useSessionStore } from "@/stores/session.store"
import { LayoutPanelLeft, Mail, ShieldCheck, Users } from "@lucide/vue"
import { computed } from "vue"
import { useRoute } from "vue-router"
import ModeToggle from "./ModeToggle.vue"

const route = useRoute()
const sessionStore = useSessionStore()

const administrationItems = computed(() =>
    getVisibleAdministrationItems(sessionStore.hasPermission).map((item) => ({
        ...item,
        icon: item.routeName === "admin-roles" ? ShieldCheck : item.routeName === "admin-members" ? Users : Mail,
    })),
)

const props = defineProps<{
    open: boolean
}>()
</script>

<template>
    <Sidebar collapsible="icon">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <div class="flex flex-row text-left text-sm leading-tight gap-2 truncate justify-center">
                        <LayoutPanelLeft class="size-4" />
                        <span
                            class="truncate font-semibold"
                            v-if="props.open"
                            >{{ APP_NAME }}</span
                        >
                    </div>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
            <SidebarGroup v-if="administrationItems.length">
                <SidebarGroupLabel>Administration</SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem
                            v-for="item in administrationItems"
                            :key="item.route"
                        >
                            <SidebarMenuButton
                                as-child
                                :is-active="route.path === item.route"
                                :tooltip="item.label"
                            >
                                <RouterLink :to="item.route">
                                    <component :is="item.icon" />
                                    <span>{{ item.label }}</span>
                                </RouterLink>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter class="gap-1">
            <div
                class="flex items-center gap-1"
                :class="{ 'flex-row': props.open, 'flex-col': !props.open }"
            >
                <OrganizationSwitcher :small="!props.open" />
                <ModeToggle />
            </div>
            <NavUser
                v-if="sessionStore.user"
                :user="sessionStore.user"
            />
        </SidebarFooter>
        <SidebarRail />
    </Sidebar>
</template>
