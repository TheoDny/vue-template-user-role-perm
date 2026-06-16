<script setup lang="ts">
import { Building2, Mail, ShieldCheck, Users } from "@lucide/vue"
import { computed } from "vue"
import { useRoute } from "vue-router"
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
  SidebarSeparator,
} from "@/components/ui/sidebar"
import OrganizationSwitcher from "@/components/layout/OrganizationSwitcher.vue"
import NavUser from "@/components/layout/NavUser.vue"
import { useSessionStore } from "@/stores/session.store"
import type { Permission } from "@/types/permission.type"

const route = useRoute()
const sessionStore = useSessionStore()

const administrationItems = computed(() =>
  [
    {
      label: "Roles",
      route: "/admin/roles",
      permission: "ac:read" as Permission,
      icon: ShieldCheck,
    },
    {
      label: "Members",
      route: "/admin/members",
      permission: "member:read" as Permission,
      icon: Users,
    },
    {
      label: "Invitations",
      route: "/admin/invitations",
      permission: "invitation:read" as Permission,
      icon: Mail,
    },
  ].filter((item) => sessionStore.hasPermission(item.permission)),
)
</script>

<template>
  <Sidebar collapsible="icon">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            tooltip="Organization administration"
          >
            <Building2 />
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">Organizations</span>
              <span class="truncate text-xs text-muted-foreground">
                {{ sessionStore.activeOrganization?.name ?? "No active organization" }}
              </span>
            </div>
          </SidebarMenuButton>
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
    <SidebarFooter class="gap-3">
      <OrganizationSwitcher />
      <NavUser
        v-if="sessionStore.user"
        :user="sessionStore.user"
      />
    </SidebarFooter>
  </Sidebar>
</template>

