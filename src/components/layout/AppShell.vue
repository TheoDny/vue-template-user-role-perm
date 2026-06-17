<script setup lang="ts">
import AppSidebar from "@/components/sidebar/AppSidebar.vue"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { ref } from "vue"
import { RouterView } from "vue-router"

const open = ref(true)
</script>

<template>
  <SidebarProvider :open="open" @update:open="open = $event">
    <AppSidebar :open="open" />
    <SidebarInset>
      <header class="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <SidebarTrigger />
        <Separator
          orientation="vertical"
          class="h-5"
        />
        <div class="min-w-0">
          <p class="truncate text-sm font-medium">Organization administration</p>
        </div>
      </header>
      <main class="min-h-[calc(100svh-3.5rem)] bg-background">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
