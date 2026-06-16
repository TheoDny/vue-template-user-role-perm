<script setup lang="ts">
import { RouterView } from "vue-router"
import AppSidebar from "@/components/layout/AppSidebar.vue"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Toaster } from "@/components/ui/sonner"
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
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
    <Toaster />
  </SidebarProvider>
</template>
