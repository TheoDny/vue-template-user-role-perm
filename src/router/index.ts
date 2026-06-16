import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router"
import { isApiError } from "@/services/api.service"
import { useSessionStore } from "@/stores/session.store"
import type { Permission } from "@/types/permission.type"

declare module "vue-router" {
  interface RouteMeta {
    requiresAuth?: boolean
    permission?: Permission
    guestOnly?: boolean
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/LoginView.vue"),
    meta: { guestOnly: true },
  },
  {
    path: "/",
    component: () => import("@/components/layout/AppShell.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "home",
        component: () => import("@/views/HomeRedirectView.vue"),
      },
      {
        path: "admin/roles",
        name: "admin-roles",
        component: () => import("@/views/RolesView.vue"),
        meta: { permission: "ac:read" },
      },
      {
        path: "admin/members",
        name: "admin-members",
        component: () => import("@/views/MembersView.vue"),
        meta: { permission: "member:read" },
      },
      {
        path: "admin/invitations",
        name: "admin-invitations",
        component: () => import("@/views/InvitationsView.vue"),
        meta: { permission: "invitation:read" },
      },
      {
        path: "account",
        name: "account",
        component: () => import("@/views/AccountView.vue"),
      },
      {
        path: "access-denied",
        name: "access-denied",
        component: () => import("@/views/AccessDeniedView.vue"),
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const sessionStore = useSessionStore()

  if (!sessionStore.loaded && (to.meta.requiresAuth || to.meta.permission || to.meta.guestOnly)) {
    try {
      await sessionStore.refreshSession()
    } catch (error) {
      if (!isApiError(error) || error.status !== 401) {
        console.error(error)
      }
    }
  }

  if (to.meta.guestOnly && sessionStore.isAuthenticated) {
    return { name: "home" }
  }

  if ((to.meta.requiresAuth || to.meta.permission) && !sessionStore.isAuthenticated) {
    return { name: "login", query: { redirect: to.fullPath } }
  }

  if (to.meta.permission && !sessionStore.hasPermission(to.meta.permission)) {
    return { name: "access-denied" }
  }

  return true
})

