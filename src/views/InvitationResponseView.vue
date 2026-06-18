<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRoute, useRouter } from "vue-router"
import { toast } from "vue-sonner"
import { ArrowLeft, Check, LogOut, X } from "@lucide/vue"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getApiErrorMessage, isApiError } from "@/services/api.service"
import { signOut as signOutRequest } from "@/services/auth.service"
import {
    acceptInvitation,
    getPublicInvitation,
    rejectInvitation,
} from "@/services/organization-invitation.service"
import { useSessionStore } from "@/stores/session.store"
import type { PublicInvitation } from "@/types/organization-invitation.type"

const route = useRoute()
const router = useRouter()
const sessionStore = useSessionStore()

const invitation = ref<PublicInvitation | null>(null)
const loading = ref(true)
const resolvingInvitation = ref(false)
const pendingAction = ref<"accept" | "reject" | "logout" | null>(null)
const resolutionFailed = ref(false)
const completedAction = ref<"accepted" | "rejected" | null>(null)

const invitationId = computed(() => String(route.params.invitationId ?? ""))
const redirectTarget = computed(() => route.fullPath)
const invitationEmail = computed(() => invitation.value?.email?.toLowerCase() ?? null)
const currentUserEmail = computed(() => sessionStore.user?.email?.toLowerCase() ?? null)
const hasSession = computed(() => sessionStore.isAuthenticated)
const canVerifyInvitee = computed(() => Boolean(invitationEmail.value && currentUserEmail.value))
const isDifferentInvitee = computed(
    () => canVerifyInvitee.value && invitationEmail.value !== currentUserEmail.value,
)
const isAnswerableStatus = computed(() => !invitation.value || invitation.value.status === "pending")
const canAnswerInvitation = computed(
    () => hasSession.value && !isDifferentInvitee.value && isAnswerableStatus.value && !completedAction.value,
)
const organizationName = computed(() => invitation.value?.organization?.name ?? "this organization")
const roleLabel = computed(() => {
    const roles = invitation.value?.role

    if (Array.isArray(roles)) {
        return roles.join(", ")
    }

    return roles ?? "Member"
})

function showErrorToast(error: unknown, fallback: string) {
    const message = getApiErrorMessage(error, fallback)

    if (message) {
        toast.error(message)
    }
}

onMounted(async () => {
    await bootstrap()
})

async function bootstrap() {
    loading.value = true

    try {
        if (!sessionStore.loaded) {
            try {
                await sessionStore.refreshSession()
            } catch {
                sessionStore.clearSession()
            }
        }

        if (!sessionStore.isAuthenticated) {
            await router.replace({ name: "login", query: { redirect: redirectTarget.value } })
            return
        }

        await resolveInvitationDetails()
    } finally {
        loading.value = false
    }
}

async function resolveInvitationDetails() {
    resolvingInvitation.value = true
    resolutionFailed.value = false

    try {
        const organizationId = typeof route.query.organizationId === "string" ? route.query.organizationId : null
        const candidateOrganizationIds = [
            organizationId,
            sessionStore.activeOrganizationId,
            ...sessionStore.organizations.map((organization) => organization.id),
        ].filter((value, index, values): value is string => Boolean(value) && values.indexOf(value) === index)

        for (const candidateOrganizationId of candidateOrganizationIds) {
            try {
                invitation.value = await getPublicInvitation(candidateOrganizationId, invitationId.value)
                return
            } catch (error) {
                if (!isApiError(error) || error.status !== 404) {
                    throw error
                }
            }
        }

        resolutionFailed.value = true
    } catch (error) {
        resolutionFailed.value = true
        showErrorToast(error, "Unable to load invitation details")
    } finally {
        resolvingInvitation.value = false
    }
}

async function handleAccept() {
    pendingAction.value = "accept"

    try {
        await acceptInvitation(invitationId.value)
        completedAction.value = "accepted"
        toast.success("Invitation accepted")
        await sessionStore.refreshSession()
    } catch (error) {
        showErrorToast(error, "Unable to accept invitation")
    } finally {
        pendingAction.value = null
    }
}

async function handleReject() {
    pendingAction.value = "reject"

    try {
        await rejectInvitation(invitationId.value)
        completedAction.value = "rejected"
        toast.success("Invitation rejected")
    } catch (error) {
        showErrorToast(error, "Unable to reject invitation")
    } finally {
        pendingAction.value = null
    }
}

async function handleLogout() {
    pendingAction.value = "logout"

    try {
        await signOutRequest()
    } catch {
        // The local session should still be cleared if the remote logout already expired.
    } finally {
        sessionStore.clearSession()
        pendingAction.value = null
        await router.replace({ name: "login", query: { redirect: redirectTarget.value } })
    }
}
</script>

<template>
    <main class="flex min-h-screen items-center justify-center bg-background p-6">
        <Card class="w-full max-w-xl">
            <CardHeader>
                <div class="flex items-start justify-between gap-4">
                    <div class="flex min-w-0 flex-col gap-1">
                        <CardTitle>Organization invitation</CardTitle>
                        <CardDescription> Review this invitation before joining the workspace. </CardDescription>
                    </div>
                    <Badge
                        v-if="invitation?.status"
                        variant="secondary"
                        class="shrink-0"
                    >
                        {{ invitation.status }}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <div
                    v-if="loading"
                    class="flex flex-col gap-3 text-sm text-muted-foreground"
                >
                    <div class="h-4 w-2/3 rounded-md bg-muted" />
                    <div class="h-4 w-1/2 rounded-md bg-muted" />
                    <div class="h-4 w-3/4 rounded-md bg-muted" />
                </div>

                <div
                    v-else-if="completedAction"
                    class="flex flex-col gap-3"
                >
                    <p class="text-sm text-muted-foreground">The invitation has been {{ completedAction }}.</p>
                    <Button
                        as-child
                        variant="outline"
                    >
                        <RouterLink to="/">
                            <ArrowLeft data-icon="inline-start" />
                            Go to workspace
                        </RouterLink>
                    </Button>
                </div>

                <div
                    v-else-if="isDifferentInvitee"
                    class="flex flex-col gap-4"
                >
                    <p class="text-sm text-muted-foreground">
                        This invitation was sent to {{ invitation?.email }}, but you are currently signed in as
                        {{ sessionStore.user?.email }}.
                    </p>
                    <Separator />
                    <p class="text-sm text-muted-foreground">
                        Sign out, then sign in with the invited email address to continue.
                    </p>
                </div>

                <div
                    v-else
                    class="flex flex-col gap-4"
                >
                    <div class="flex flex-col gap-1">
                        <p class="text-sm font-medium">{{ organizationName }}</p>
                        <p class="text-sm text-muted-foreground">You are invited as {{ roleLabel }}.</p>
                    </div>

                    <Separator />

                    <div class="grid gap-3 text-sm sm:grid-cols-2">
                        <div class="flex flex-col gap-1">
                            <span class="text-muted-foreground">Invited email</span>
                            <span class="font-medium">{{ invitation?.email ?? sessionStore.user?.email }}</span>
                        </div>
                        <div class="flex flex-col gap-1">
                            <span class="text-muted-foreground">Signed in as</span>
                            <span class="font-medium">{{ sessionStore.user?.email }}</span>
                        </div>
                    </div>

                    <p
                        v-if="resolutionFailed"
                        class="text-sm text-muted-foreground"
                    >
                        Detailed invitation information could not be loaded from this link. You can still answer
                        the invitation with the current signed-in account.
                    </p>

                    <p
                        v-if="resolvingInvitation"
                        class="text-sm text-muted-foreground"
                    >
                        Loading invitation details...
                    </p>

                    <p
                        v-if="!isAnswerableStatus"
                        class="text-sm text-muted-foreground"
                    >
                        This invitation can no longer be accepted or rejected.
                    </p>
                </div>
            </CardContent>

            <CardFooter
                v-if="!loading && (isDifferentInvitee || canAnswerInvitation)"
                class="justify-end gap-2"
            >
                <template v-if="!loading && isDifferentInvitee">
                    <Button
                        variant="outline"
                        :disabled="pendingAction === 'logout'"
                        @click="handleLogout"
                    >
                        <LogOut data-icon="inline-start" />
                        {{ pendingAction === "logout" ? "Signing out..." : "Sign out" }}
                    </Button>
                </template>

                <template v-else-if="!loading && canAnswerInvitation">
                    <Button
                        variant="outline"
                        :disabled="Boolean(pendingAction)"
                        @click="handleReject"
                    >
                        <X data-icon="inline-start" />
                        {{ pendingAction === "reject" ? "Rejecting..." : "Reject" }}
                    </Button>
                    <Button
                        :disabled="Boolean(pendingAction)"
                        @click="handleAccept"
                    >
                        <Check data-icon="inline-start" />
                        {{ pendingAction === "accept" ? "Accepting..." : "Accept" }}
                    </Button>
                </template>
            </CardFooter>
        </Card>
    </main>
</template>
