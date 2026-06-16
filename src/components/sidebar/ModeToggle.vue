<script setup lang="ts">
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Monitor, Moon, Sun } from "@lucide/vue"
import { useColorMode } from "@vueuse/core"

// Pass { disableTransition: false } to enable transitions
const mode = useColorMode({ disableTransition: false })
</script>

<template>
    <DropdownMenu class="w-10">
        <DropdownMenuTrigger as-child>
            <Button variant="outline">
                <Moon class="scale-100 dark:scale-0" />
                <Sun class="absolute scale-0 dark:scale-100" />
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="min-w-9">
            <DropdownMenuItem
                @click="mode = 'light'"
                class="cursor-pointer"
            >
                <Sun />
            </DropdownMenuItem>
            <DropdownMenuItem
                @click="mode = 'dark'"
                class="cursor-pointer"
            >
                <Moon />
            </DropdownMenuItem>
            <DropdownMenuItem
                @click="mode = 'auto'"
                class="cursor-pointer"
            >
                <Monitor />
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
</template>
