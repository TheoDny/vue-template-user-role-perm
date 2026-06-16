# Organization Administration Interface Specification

## Objective

Build a Vue 3 administration interface that lets authenticated users manage organization roles, members, and invitations through the existing NestJS and Better Auth API.

The interface must use the current shadcn-vue component library in `src/components/ui/` as much as possible, keep API communication in dedicated service modules, keep domain contracts in dedicated type files, and display navigation items dynamically from the current user's `read` permissions.

All implementation code, code comments, branch names, and commit messages must be written in English.

## Documentation Inputs

- Backend route inspection from `D:\Documents\projets\test\nest-template-user-role-perm-better-auth`.
- shadcn-vue Context7 documentation for `Sidebar`, `Dialog`, `AlertDialog`, `DropdownMenu`, `Select`, `Checkbox`, `Field`, and table/list patterns.
- Better Auth Context7 documentation for organization dynamic access control, active organization switching, and runtime role creation.
- Local shadcn-vue project info:
  - Framework: Vite
  - Package manager: pnpm
  - Tailwind: v4
  - Alias prefix: `@`
  - UI alias: `@/components/ui`
  - Icon library: lucide

## Environment

The frontend must provide a `.env.example` with the public API location used by services.

Required variables:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_BETTER_AUTH_BASE_PATH=/api/auth
```

Service code must read these values from `import.meta.env`, keep `credentials: "include"` on authenticated requests, and avoid hardcoded API origins.

## Backend API Inventory

The NestJS backend does not define a global prefix for custom controllers. Better Auth is configured with `basePath: "/api/auth"`.

### Session And Auth

| Method | Path | Purpose | Body |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | Sign in with email and password | `{ email, password, rememberMe?, callbackURL? }` |
| `POST` | `/auth/logout` | Sign out current session | none |
| `GET` | `/auth/authenticated` | Check if a session exists | none |
| `GET` | `/auth/session` | Get custom session, permissions, roles, and organizations | none |
| `POST` | `/auth/active-organization` | Set active organization for the current session | `{ organizationId?: string | null, organizationSlug?: string }` |

### Permissions

| Method | Path | Permission | Purpose | Body |
| --- | --- | --- | --- | --- |
| `GET` | `/permissions` | public | List API permissions and resources | none |
| `POST` | `/permissions/check` | authenticated | Check user permissions | `{ permissions: string[] }` |

Available permission resources:

```ts
type OrganizationPermissionResource = "organization" | "member" | "invitation" | "ac"
```

Available actions:

```ts
const permissionResources = {
    organization: ["update", "delete"],
    member: ["create", "read", "update", "delete"],
    invitation: ["create", "read", "update", "cancel"],
    ac: ["create", "read", "update", "delete"],
}
```

### Roles

| Method | Path | Required permission | Purpose | Body |
| --- | --- | --- | --- | --- |
| `GET` | `/roles` | `ac:read` | List organization roles for the active organization | none |
| `POST` | `/roles` | `ac:create` | Create an organization role for the active organization | `{ role: string, permissions?: Record<string, string[]> }` |
| `PATCH` | `/roles/:roleId` | `ac:update` | Rename a role | `{ name: string }` |
| `PATCH` | `/roles/:roleId/permissions` | `ac:update` | Update role permission matrix | `{ permissions: Record<string, string[]> }` |
| `DELETE` | `/roles/:roleId` | `ac:delete` | Delete a role | none |

### Members

| Method | Path | Required permission | Purpose | Body |
| --- | --- | --- | --- | --- |
| `GET` | `/members` | `member:read` | List organization members for the active organization | none |
| `PATCH` | `/members/:memberId/roles` | `member:update` | Replace assigned roles for a member | `{ roles: string[] }` |
| `DELETE` | `/members/:memberId` | `member:delete` | Remove a member from the organization | none |

### Invitations

| Method | Path | Required permission | Purpose | Body |
| --- | --- | --- | --- | --- |
| `POST` | `/invitations` | `invitation:create` | Create or resend an invitation | `{ email, roles, resend? }` |
| `GET` | `/invitations` | `invitation:read` | List invitations for the active organization | none |
| `GET` | `/organizations/:organizationId/invitations/:invitationId` | public | Get public invitation details | none |
| `PATCH` | `/invitations/:invitationId/roles` | `invitation:update` | Replace roles on a pending invitation | `{ roles: string[] }` |
| `POST` | `/invitations/:invitationId/cancel` | `invitation:cancel` | Cancel an invitation | none |
| `POST` | `/invitations/:invitationId/accept` | authenticated invited user | Accept an invitation | none |
| `POST` | `/invitations/:invitationId/reject` | authenticated invited user | Reject an invitation | none |

## Frontend Architecture

### Required folders

```text
src/
  components/
    organization-admin/
    layout/
  composables/
  router/
  services/
  stores/
  types/
  views/
```

### Services

No Vue component should call `fetch` directly. Components call the session store, feature composables, or services. Components must not bypass service modules.

Required service modules:

| File | Responsibility |
| --- | --- |
| `src/services/api.service.ts` | Shared HTTP client, JSON parsing, credentials, base URL, error normalization |
| `src/services/auth.service.ts` | `login`, `signOut`, `getAuthenticated` |
| `src/services/session.service.ts` | `getSession`, refresh current user permissions and organizations |
| `src/services/organization.service.ts` | `setActiveOrganization` through the custom Nest auth route |
| `src/services/permission.service.ts` | `listPermissions`, `checkPermissions` |
| `src/services/organization-role.service.ts` | `listRoles`, `createRole`, `updateRoleName`, `updateRolePermissions`, `deleteRole` |
| `src/services/organization-member.service.ts` | `listMembers`, `updateMemberRoles`, `deleteMember` |
| `src/services/organization-invitation.service.ts` | `listInvitations`, `createInvitation`, `updateInvitationRoles`, `cancelInvitation`, `acceptInvitation`, `rejectInvitation`, `getPublicInvitation` |

### Types

Domain types must be declared in `src/types/` with the `xxxxx.type.ts` naming convention.

Required type modules:

| File | Examples |
| --- | --- |
| `src/types/api.type.ts` | `ApiError`, `ApiResult`, `HttpMethod` |
| `src/types/auth.type.ts` | `LoginRequest`, `AuthenticatedResponse`, `CustomSession`, `SessionUser` |
| `src/types/organization.type.ts` | `OrganizationSummary`, `SetActiveOrganizationRequest` |
| `src/types/permission.type.ts` | `PermissionAction`, `ApiPermission`, `PermissionMatrix`, `PermissionCheckResult` |
| `src/types/organization-role.type.ts` | `OrganizationRole`, `CreateRoleRequest`, `UpdateRolePermissionsRequest` |
| `src/types/organization-member.type.ts` | `OrganizationMember`, `UpdateMemberRolesRequest` |
| `src/types/organization-invitation.type.ts` | `OrganizationInvitation`, `InvitationStatus`, `CreateInvitationRequest` |
| `src/types/sidebar.type.ts` | `SidebarCategory`, `SidebarItem`, `PermissionRequirement` |

### SOLID Rules

- Single Responsibility: each service owns one API domain only.
- Open/Closed: adding a future tab must be done by adding a sidebar item definition, not rewriting sidebar rendering.
- Liskov Substitution: services must return typed domain objects or throw normalized `ApiError` objects consistently.
- Interface Segregation: components receive only the props and emits they need, not entire stores unless necessary.
- Dependency Inversion: feature views depend on service abstractions or store actions, not low-level fetch details.

## Layout And Navigation

The app must use shadcn-vue `Sidebar` components for the main layout.

Required layout components:

| Component | Purpose |
| --- | --- |
| `src/components/layout/AppSidebar.vue` | Renders dynamic navigation and sidebar footer |
| `src/components/layout/NavUser.vue` | Renders authenticated user dropdown |
| `src/components/layout/OrganizationSwitcher.vue` | Selects active organization |
| `src/components/layout/AppShell.vue` | Wraps `SidebarProvider`, sidebar, main content, and route outlet |

### Dynamic sidebar

Sidebar category: `Administration`.

Items:

| Label | Route | Required read permission |
| --- | --- | --- |
| Roles | `/admin/roles` | `ac:read` |
| Members | `/admin/members` | `member:read` |
| Invitations | `/admin/invitations` | `invitation:read` |

Rules:

- Render a sidebar item only when the current session permissions include its required read permission.
- Hide the `Administration` category when no item is visible.
- On organization change, call `setActiveOrganization`, then refresh `/auth/session`, roles, members, invitations, and permissions for the current route.
- If the current route becomes unauthorized after organization change, redirect to the first visible administration route.
- If no administration route is visible, render an access denied or empty state.

### Sidebar footer

The footer must contain:

- Organization dropdown/select using the organizations returned by `/auth/session`.
- `NavUser.vue` with user avatar, account link, and sign out.
- A visible sign out command can be present in `NavUser.vue`; avoid duplicating sign out actions unless the final UX requires both.

Implementation note for `NavUser.vue`:

The provided sample has a name collision between the imported `signOut` service and the local `signOut` handler. Use either `import { signOut as signOutRequest }` or name the handler `handleSignOut`.

## Roles View

Route: `/admin/roles`

Required read permission: `ac:read`.

Required components:

- `Button`
- `Dialog`
- `AlertDialog`
- `Checkbox`
- `Field`, `FieldGroup`, `FieldSet`, `FieldLegend`, `FieldLabel`
- `Input`
- `Badge`
- `ScrollArea` if added later
- `Skeleton`
- `Empty`
- `Separator`
- `sonner` toast

Layout:

- Left panel: selectable list of roles.
- Right panel: selectable list or matrix of permissions for the selected role.
- Header actions: create role button, save permissions button.

Behavior:

- Selecting a role loads its current permissions into an editable draft.
- Renaming a role opens a `Dialog`.
- Creating a role opens a `Dialog` with name and initial permissions.
- Deleting a role uses `AlertDialog` confirmation and a trash icon action on the role row.
- Permission changes are saved only after explicit validation.
- Use optimistic UI only if rollback handling is implemented. Otherwise refresh from API after mutation.

Action permission gates:

| Action | Required permission |
| --- | --- |
| View roles | `ac:read` |
| Create role | `ac:create` |
| Rename role | `ac:update` |
| Update role permissions | `ac:update` |
| Delete role | `ac:delete` |

Acceptance criteria:

- Users without `ac:read` cannot open or see the route.
- Users without `ac:update` can inspect but cannot save permission changes.
- Static roles such as `owner`, `admin`, and `member` must be visually identifiable.
- Deleting the `owner` role must be blocked in the UI and is also blocked by the backend.
- API errors are displayed through toast and preserve the user's unsaved draft.

## Members View

Route: `/admin/members`

Required read permission: `member:read`.

Required components:

- `Avatar`
- `Badge`
- `Button`
- `Checkbox`
- `Field`, `FieldGroup`, `FieldSet`, `FieldLegend`
- `AlertDialog`
- `Skeleton`
- `Empty`
- `Separator`
- `sonner` toast

Layout:

- Left panel: selectable list of organization members.
- Right panel: assignable role list for the selected member.

Behavior:

- Selecting a member loads its current role list into an editable draft.
- Saving roles calls `PATCH /members/:memberId/roles` with `{ roles: string[] }`.
- Removing a member, if implemented in the first release, must use confirmation.
- The current user must not be offered a self-removal action because the backend rejects it.
- Removing or demoting the last owner must be prevented where detectable and handled from backend errors otherwise.

Action permission gates:

| Action | Required permission |
| --- | --- |
| View members | `member:read` |
| Update member roles | `member:update` |
| Delete member | `member:delete` |

Acceptance criteria:

- Role save is disabled until the draft differs from the persisted roles.
- At least one role must remain selected because backend DTOs require `ArrayNotEmpty`.
- Member roles must be parsed defensively because Better Auth may return comma-separated role strings.

## Invitations View

Route: `/admin/invitations`

Required read permission: `invitation:read`.

Required components:

- `Badge`
- `Button`
- `Checkbox`
- `Dialog`
- `Field`, `FieldGroup`, `FieldSet`, `FieldLegend`, `FieldLabel`
- `Input`
- `AlertDialog`
- `Skeleton`
- `Empty`
- `Separator`
- `sonner` toast

Layout:

- Left panel: selectable list of invitations with status.
- Right panel: role list for the selected invitation.

Behavior:

- Creating an invitation opens a dialog with email, role selection, and optional resend flag.
- Selecting an invitation loads its assigned roles into an editable draft.
- Saving roles calls `PATCH /invitations/:invitationId/roles` with `{ roles: string[] }`.
- Only pending invitations can be updated.
- Cancel action calls `POST /invitations/:invitationId/cancel` and requires confirmation.
- Accepted and rejected invitations should be read-only.

Action permission gates:

| Action | Required permission |
| --- | --- |
| View invitations | `invitation:read` |
| Create invitation | `invitation:create` |
| Update invitation roles | `invitation:update` |
| Cancel invitation | `invitation:cancel` |

Acceptance criteria:

- Status is shown with `Badge`.
- Role save is disabled for non-pending invitations.
- Email field validates locally before submit.
- At least one role must be selected before create or update.

## Router Requirements

Required routes:

| Path | Component | Guard |
| --- | --- | --- |
| `/login` | login view, if not already present | redirect authenticated users |
| `/admin/roles` | roles view | `ac:read` |
| `/admin/members` | members view | `member:read` |
| `/admin/invitations` | invitations view | `invitation:read` |
| `/account` | account placeholder or user page | authenticated |
| `/` | redirect to first allowed admin tab | authenticated |

Route guards must use the current session store. If no session is loaded, fetch `/auth/session` before deciding.

## State Management

Use Pinia only for session-wide application state.

| Store | Responsibility |
| --- | --- |
| `useSessionStore` | user, organizations, active organization, roles, permissions, refresh session |

Feature data does not need Pinia stores. Roles, members, invitations, and permission catalog state should live in route-level components or feature composables such as `useRolesAdministration`, `useMembersAdministration`, `useInvitationsAdministration`, and `usePermissionCatalog`.

`useSessionStore` should expose explicit actions and derived getters, for example `refreshSession`, `setActiveOrganization`, `can("ac:update")`, and `hasPermission("member:read")`.

## UI Rules

- Use shadcn-vue components from `@/components/ui` before writing custom styled markup.
- Use semantic Tailwind tokens such as `bg-background`, `text-muted-foreground`, `border-border`, and component variants.
- Use `gap-*` for spacing, not `space-x-*` or `space-y-*`.
- Use lucide icons in icon buttons for edit, delete, save, user, roles, invitations, and logout actions.
- Use tooltips for icon-only actions.
- `Dialog` and `AlertDialog` must include accessible titles and descriptions.
- Use `Skeleton` for loading states and `Empty` for empty lists if the component is installed during implementation.
- Keep admin screens dense and operational, not marketing oriented.

## Error Handling

The shared API service must normalize failed responses into:

```ts
type ApiError = {
    status: number
    message: string
    code?: string
    details?: unknown
}
```

Rules:

- `401`: redirect to `/login`.
- `403`: show access denied and refresh session permissions.
- `404`: show resource not found in the current panel.
- `422` or `400`: show form errors where possible.
- Network failures: show a retryable toast.

## Testing And Verification

Minimum checks per phase:

- `pnpm build`
- Type checking through the existing build script.
- Manual browser verification for the implemented route.

Recommended tests:

- Unit tests for permission helpers.
- Service tests with mocked fetch.
- Session store tests for authentication, organization switching, and permission checks.
- Feature composable tests where mutation state is complex.
- Route guard tests for allowed and denied permissions.

## Git Workflow

Use `develop` as the integration branch.

For every implementation phase:

1. Start from an up-to-date `develop`.
2. Create a new branch from `develop`.
3. Branch names must start with `feature/`.
4. Commit regularly with clear English messages.
5. Merge the feature branch into `develop` when the phase is complete.
6. Tag `develop` after the merge with a version matching `0.X.X-develop`.
7. Start the next phase from `develop`.

## Proposed Implementation Phases

### Phase 1: Project foundation

Branch: `feature/project-foundation`

Tag after merge: `0.1.0-develop`

Scope:

- Add `.env.example`.
- Add shared API service.
- Add base type files.
- Add router skeleton.
- Add Pinia setup for `useSessionStore`.
- Add app shell placeholder.

### Phase 2: Session and organization context

Branch: `feature/session-organization-context`

Tag after merge: `0.2.0-develop`

Scope:

- Implement auth and session services.
- Implement session store.
- Implement organization switcher.
- Implement `NavUser.vue`.
- Implement sign out flow.

### Phase 3: Permission-driven navigation

Branch: `feature/permission-driven-navigation`

Tag after merge: `0.3.0-develop`

Scope:

- Implement permission service and permission helpers or composable.
- Implement dynamic sidebar.
- Implement route guards.
- Implement first allowed admin route redirect.

### Phase 4: Roles administration

Branch: `feature/roles-administration`

Tag after merge: `0.4.0-develop`

Scope:

- Implement roles service and types.
- Implement roles list.
- Implement permission matrix editor.
- Implement rename dialog.
- Implement create role dialog with `POST /roles`.
- Implement delete confirmation.

### Phase 5: Members administration

Branch: `feature/members-administration`

Tag after merge: `0.5.0-develop`

Scope:

- Implement members service and types.
- Implement member list.
- Implement member role assignment editor.
- Implement member removal confirmation if included in release scope.

### Phase 6: Invitations administration

Branch: `feature/invitations-administration`

Tag after merge: `0.6.0-develop`

Scope:

- Implement invitations service and types.
- Implement invitation list with status badges.
- Implement invitation creation dialog.
- Implement invitation role editor.
- Implement cancel confirmation.

### Phase 7: UX hardening and accessibility

Branch: `feature/admin-ux-hardening`

Tag after merge: `0.7.0-develop`

Scope:

- Add empty states.
- Add loading skeletons.
- Add disabled states from permissions.
- Add keyboard and focus verification.
- Add responsive layout pass.

### Phase 8: Tests and documentation

Branch: `feature/admin-tests-documentation`

Tag after merge: `0.8.0-develop`

Scope:

- Add service and permission helper tests.
- Add store tests where practical.
- Verify `pnpm build`.
- Update project README with setup and implementation notes.

## Open Decisions

- Whether the first release includes member deletion or only role assignment.
- Whether invitation accept and reject screens belong in the admin app or a separate public invitation flow.
- Whether role names should be editable for static Better Auth roles or only for dynamic roles.
- Whether to install and use `Table`, `ScrollArea`, and `Empty` if the current component set is not sufficient for dense lists.
