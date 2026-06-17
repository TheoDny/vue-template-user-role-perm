<script setup lang="ts">
import AccountAccessCard from "@/components/account/AccountAccessCard.vue"
import AccountProfileCard from "@/components/account/AccountProfileCard.vue"
import AccountSecurityCard from "@/components/account/AccountSecurityCard.vue"
import AccountSessionsCard from "@/components/account/AccountSessionsCard.vue"
</script>

<template>
    <section class="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
        <div class="flex flex-col gap-1">
            <h1 class="text-2xl font-semibold tracking-normal">Account</h1>
            <p class="text-sm text-muted-foreground">Manage your profile, password, roles, and permissions.</p>
        </div>

        <div class="grid gap-6 xl:grid-cols-[minmax(18rem,22rem)_1fr]">
            <div class="flex flex-col gap-6">
                <AccountProfileCard />
                <AccountSecurityCard />
                <AccountSessionsCard />
            </div>
            <AccountAccessCard />
        </div>
    </section>
</template>
