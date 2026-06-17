<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { toast } from "vue-sonner"
import { Laptop, RefreshCw, ShieldX } from "@lucide/vue"
import ConfirmDialog from "@/components/common/ConfirmDialog.vue"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { isApiError } from "@/services/api.service"
import { listSessions, revokeSession } from "@/services/auth.service"
import { useSessionStore } from "@/stores/session.store"
import type { UserSessionSummary } from "@/types/auth.type"

const sessionStore = useSessionStore()
const sessions = ref<UserSessionSummary[]>([])
const loading = ref(false)
const revoking = ref(false)
const revokeDialogOpen = ref(false)
const sessionToRevoke = ref<UserSessionSummary | null>(null)

const currentSessionToken = computed(() => sessionStore.session?.session.token ?? null)
const otherSessions = computed(() =>
    sessions.value
        .filter((session) => session.token !== currentSessionToken.value)
        .sort((left, right) => dateValue(right.updatedAt) - dateValue(left.updatedAt)),
)

onMounted(() => {
    void refreshSessions()
})

async function refreshSessions() {
    loading.value = true

    try {
        sessions.value = await listSessions()
    } catch (error) {
        toast.error(isApiError(error) ? error.message : "Unable to load sessions")
    } finally {
        loading.value = false
    }
}

function openRevokeDialog(session: UserSessionSummary) {
    sessionToRevoke.value = session
    revokeDialogOpen.value = true
}

async function handleRevokeSession() {
    if (!sessionToRevoke.value) {
        return
    }

    revoking.value = true

    try {
        await revokeSession({ token: sessionToRevoke.value.token })
        toast.success("Session revoked")
        revokeDialogOpen.value = false
        sessionToRevoke.value = null
        await refreshSessions()
    } catch (error) {
        toast.error(isApiError(error) ? error.message : "Unable to revoke session")
    } finally {
        revoking.value = false
    }
}

function dateValue(value: string | Date): number {
    return new Date(value).getTime()
}

function formatDate(value: string | Date): string {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value))
}

function getSessionLabel(session: UserSessionSummary): string {
    return session.userAgent || "Unknown device"
}
</script>

<template>
    <Card>
        <CardHeader>
            <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 flex-col gap-1">
                    <CardTitle>Active sessions</CardTitle>
                    <CardDescription>Review and revoke sessions from other devices.</CardDescription>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    :disabled="loading"
                    @click="refreshSessions"
                >
                    <RefreshCw />
                    <span class="sr-only">Refresh sessions</span>
                </Button>
            </div>
        </CardHeader>
        <CardContent>
            <div
                v-if="loading"
                class="flex flex-col gap-3"
            >
                <Skeleton class="h-16 w-full" />
                <Skeleton class="h-16 w-full" />
            </div>

            <div
                v-else-if="otherSessions.length"
                class="flex flex-col gap-3"
            >
                <div
                    v-for="session in otherSessions"
                    :key="session.id"
                    class="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div class="flex min-w-0 gap-3">
                        <div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                            <Laptop />
                        </div>
                        <div class="min-w-0">
                            <p class="truncate text-sm font-medium">{{ getSessionLabel(session) }}</p>
                            <p class="text-xs text-muted-foreground">
                                Last activity {{ formatDate(session.updatedAt) }}
                            </p>
                            <p class="text-xs text-muted-foreground">
                                Expires {{ formatDate(session.expiresAt) }}
                            </p>
                            <p
                                v-if="session.ipAddress"
                                class="text-xs text-muted-foreground"
                            >
                                {{ session.ipAddress }}
                            </p>
                        </div>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        @click="openRevokeDialog(session)"
                    >
                        <ShieldX data-icon="inline-start" />
                        Revoke
                    </Button>
                </div>
            </div>

            <p
                v-else
                class="text-sm text-muted-foreground"
            >
                No other active session was found.
            </p>
        </CardContent>
    </Card>

    <ConfirmDialog
        :open="revokeDialogOpen"
        title="Revoke this session?"
        description="This signs out the selected device. Your current session will stay active."
        confirm-label="Revoke session"
        pending-label="Revoking..."
        :pending="revoking"
        @update:open="revokeDialogOpen = $event"
        @confirm="handleRevokeSession"
    />
</template>
