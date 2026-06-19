import type { Pinia } from "pinia"
import type { Router } from "vue-router"
import { toast } from "vue-sonner"
import { setGlobalApiErrorHandler } from "@/services/api.service"
import { useSessionStore } from "@/stores/session.store"

export function installGlobalApiErrorHandler(router: Router, pinia: Pinia) {
    setGlobalApiErrorHandler((error, context) => {
        if (error.status === 401) {
            error.handled = true
            const sessionStore = useSessionStore(pinia)
            sessionStore.clearSession()

            const currentRoute = router.currentRoute.value
            if (currentRoute.name !== "login") {
                void router.replace({
                    name: "login",
                    query: { redirect: currentRoute.fullPath },
                })
            }

            return
        }

        if (error.status === 403) {
            error.handled = true
            toast.error("Access denied", {
                description: error.message || "You do not have permission to perform this action.",
            })
            return
        }

        if (error.status === 0) {
            error.handled = true
            toast.error("Network unavailable", {
                description: "The API cannot be reached right now.",
                action: {
                    label: "Retry",
                    onClick: () => {
                        void context.retry()
                    },
                },
            })
        }
    })
}
