<script setup lang="ts">
import { UsersRound } from "@lucide/vue"
</script>

<template>
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div class="flex min-w-0 items-start gap-3">
      <div class="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card">
        <UsersRound />
      </div>
      <div class="min-w-0">
        <h1 class="text-2xl font-semibold tracking-normal">Members</h1>
        <p class="text-sm text-muted-foreground">Assign organization roles to members.</p>
      </div>
    </div>
  </div>
</template>
