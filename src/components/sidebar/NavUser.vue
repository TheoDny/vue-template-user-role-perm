<script setup lang="ts">
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { signOut as signOutRequest } from "@/services/auth.service"
import { useSessionStore } from "@/stores/session.store"
import type { SessionUser } from "@/types/auth.type"
import { CircleUser, EllipsisVertical, LogOut } from "@lucide/vue"
import { computed } from "vue"
import { useRouter } from "vue-router"

const props = defineProps<{
    user: SessionUser
}>()

const { isMobile } = useSidebar()
const router = useRouter()
const sessionStore = useSessionStore()

const avatarFallback = computed(() => {
    const parts = props.user.name.trim().split(/\s+/).filter(Boolean)

    if (parts.length > 1) {
        return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    }

    return (parts[0]?.charAt(0) || props.user.email.charAt(0)).toUpperCase()
})

async function handleSignOut() {
    await signOutRequest()
    sessionStore.clearSession()
    await router.replace("/login")
}
</script>

<template>
    <SidebarMenu>
        <SidebarMenuItem>
            <DropdownMenu>
                <DropdownMenuTrigger as-child>
                    <SidebarMenuButton
                        size="lg"
                        class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                        <Avatar>
                            <AvatarImage
                                :src="user.image ?? ''"
                                :alt="user.name"
                            />
                            <AvatarFallback>{{ avatarFallback }}</AvatarFallback>
                        </Avatar>
                        <div class="grid flex-1 text-left text-sm leading-tight">
                            <span class="truncate font-medium">{{ user.name }}</span>
                            <span class="truncate text-xs text-muted-foreground">{{ user.email }}</span>
                        </div>
                        <EllipsisVertical class="ml-auto" />
                    </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    class="w-(--reka-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                    :side="isMobile ? 'bottom' : 'right'"
                    :side-offset="4"
                    align="end"
                >
                    <DropdownMenuLabel class="p-0 font-normal">
                        <div class="flex items-center gap-2 px-0.5 py-1 text-left text-sm">
                            <Avatar>
                                <AvatarImage
                                    :src="user.image ?? ''"
                                    :alt="user.name"
                                />
                                <AvatarFallback>{{ avatarFallback }}</AvatarFallback>
                            </Avatar>
                            <div class="grid flex-1 text-left text-sm leading-tight">
                                <span class="truncate font-medium">{{ user.name }}</span>
                                <span class="truncate text-xs text-muted-foreground">{{ user.email }}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            as-child
                            class="cursor-pointer"
                        >
                            <RouterLink to="/account">
                                <CircleUser />
                                <span>Account</span>
                            </RouterLink>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        class="cursor-pointer"
                        @click="handleSignOut"
                    >
                        <LogOut />
                        <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </SidebarMenuItem>
    </SidebarMenu>
</template>
