# AGENTS.md

This file is the operating guide for agents and contributors working in this frontend repository.

## Project Summary

This is a Vue 3 + Vite administration frontend for a NestJS Better Auth API. It manages organization-scoped roles, members, invitations, permissions, account security, and active sessions.

The backend sibling project is commonly located at:

```text
D:\Documents\projets\test\nest-template-user-role-perm-better-auth
```

## Core Rules

- Use `bun`.
- Keep implementation code, comments, branch names, and commit messages in English.
- Prefer small, focused changes.
- Do not revert user changes unless explicitly asked.
- Do not edit generated outputs such as `dist/`, `node_modules/`, or `tsconfig.tsbuildinfo`.
- Use `rg` / `rg --files` for searching.
- Use `apply_patch` for manual file edits.
- Keep API calls inside `src/services/`.
- Keep domain contracts in `src/types/`.
- Keep session-wide state in `useSessionStore`; do not add feature Pinia stores without a strong reason.
- Use local shadcn-vue components from `src/components/ui`.

## Commands

```bash
bun install
bun dev
bun run build
bun preview
```

Use `bun run build` as the default verification command. It runs TypeScript checking and Vite production build.

After running `bun run build`, restore `tsconfig.tsbuildinfo` if it appears in the diff:

```bash
git restore -- tsconfig.tsbuildinfo
```

## Environment

Copy `.env.example` to `.env`.

Required values:

```env
VITE_APP_NAME="Template User Role Perm"
VITE_API_BASE_URL=http://localhost:3000
VITE_BETTER_AUTH_BASE_PATH=/api/auth
```

Rules:

- `VITE_API_BASE_URL` is the Nest API origin.
- `VITE_BETTER_AUTH_BASE_PATH` is only for native Better Auth routes mounted under `/api/auth`.
- Authenticated requests must keep `credentials: "include"`.

## Architecture

```text
src/
  assets/          Tailwind v4 global styles and theme tokens
  components/
    account/       Account page cards
    auth/          Login UI
    common/        Reusable app components
    invitations/   Invitation administration UI
    layout/        App shell
    members/       Member administration UI
    roles/         Role administration UI
    sidebar/       Sidebar, organization switcher, user menu
    ui/            shadcn-vue source components
  composables/     Route-level feature state
  lib/             Helpers and static navigation data
  router/          Routes and guards
  services/        HTTP service modules
  stores/          Pinia stores
  types/           API/domain contracts
  views/           Route-level pages
```

## Routing

Routes live in `src/router/index.ts`.

Current important routes:

- `/login`
- `/`
- `/account`
- `/admin/roles`
- `/admin/members`
- `/admin/invitations`
- `/invitations/:invitationId`
- `/access-denied`

Guard behavior:

- Fetch session before guarded decisions when not loaded.
- Redirect unauthenticated users to `/login?redirect=<target>`.
- Redirect authenticated users away from `/login`.
- Check route `meta.permission` against `sessionStore.hasPermission`.

## State Management

`src/stores/session.store.ts` owns global authenticated state:

- raw custom session
- user
- permissions
- roles
- organizations
- active organization
- authentication flag
- permission checks
- session refresh
- active organization switching

Feature state should stay in:

- route components
- composables under `src/composables/`

Do not create a new Pinia store for roles, members, invitations, or account UI without a clear cross-route state requirement.

## Services

All HTTP requests must go through `apiRequest` in `src/services/api.service.ts`.

Service modules:

- `auth.service.ts`
- `session.service.ts`
- `organization.service.ts`
- `permission.service.ts`
- `organization-role.service.ts`
- `organization-member.service.ts`
- `organization-invitation.service.ts`

Rules:

- Components should call stores, composables, or service functions.
- Components should not call `fetch` directly.
- Service functions should return typed domain values or throw normalized `ApiError`.

## API Endpoints

Auth and account:

- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/authenticated`
- `GET /auth/session`
- `GET /auth/sessions`
- `POST /auth/sessions/revoke`
- `POST /auth/email-otp/send`
- `POST /auth/email-otp/sign-in`
- `POST /auth/password-reset/email-otp`
- `POST /api/auth/email-otp/reset-password`
- `POST /auth/active-organization`

Permissions:

- `GET /permissions`
- `POST /permissions/check`

Roles:

- `GET /roles`
- `POST /roles`
- `PATCH /roles/:roleId`
- `PATCH /roles/:roleId/permissions`
- `DELETE /roles/:roleId`

Members:

- `GET /members`
- `PATCH /members/:memberId/roles`
- `DELETE /members/:memberId`

Invitations:

- `GET /invitations`
- `POST /invitations`
- `POST /invitations/:invitationId/resend`
- `PATCH /invitations/:invitationId/roles`
- `POST /invitations/:invitationId/cancel`
- `POST /invitations/:invitationId/accept`
- `POST /invitations/:invitationId/reject`
- `GET /organizations/:organizationId/invitations/:invitationId`

## UI Rules

This project uses shadcn-vue with Reka UI and Tailwind CSS 4.

Rules:

- Use existing components from `src/components/ui`.
- Use semantic tokens: `bg-background`, `text-muted-foreground`, `border-border`, `bg-muted`, etc.
- Use component variants before custom colors.
- Use `gap-*` for spacing.
- Use `size-*` when width and height are equal.
- Use lucide-vue icons.
- Use `data-icon="inline-start"` or `data-icon="inline-end"` for icons inside buttons.
- Use `ConfirmDialog` for confirmation flows.
- Keep app screens operational and compact.

Important shared component:

```text
src/components/common/ConfirmDialog.vue
```

Use it for deletion, cancellation, revoke, and similar confirmation flows.

The underlying `AlertDialogContent.vue` intentionally keeps:

- overlay below the dialog content
- content above the overlay

Do not set the overlay and content to the same z-index.

## Feature Patterns

### Admin Navigation

Static definitions live in `src/lib/admin-navigation.ts`.

Add a new admin section by adding:

- route in `src/router/index.ts`
- navigation item in `admin-navigation.ts`
- read permission requirement
- view under `src/views/`

### Roles

Role state lives in `useRolesAdministration`.

Rules:

- Fetch roles and permission catalog together.
- Use a local draft for permission edits.
- Save permissions explicitly.
- Refresh after mutations.

### Members

Member state lives in `useMembersAdministration`.

Rules:

- Parse roles defensively with `parseRoleList`.
- Keep at least one role selected before saving.
- Prevent self-removal in the UI where member data allows it.
- Backend remains the source of truth for last-owner protection.

### Invitations

Invitation state lives in `useInvitationsAdministration`.

Rules:

- Only pending invitations can be edited or canceled.
- Role lists are normalized with `toUniqueRoles`.
- Invitation creation currently sends `resend: true`.
- Public invitation details require `organizationId`.

### Account

Account page components live in `src/components/account/`.

Current cards:

- profile
- password reset through email OTP
- active session list and revoke
- roles and permissions

Password reset uses:

- `POST /auth/password-reset/email-otp`
- `POST /api/auth/email-otp/reset-password`

Session revocation uses:

- `GET /auth/sessions`
- `POST /auth/sessions/revoke`

Never offer revocation of the current session in the UI.

## Invitation Links

Frontend invitation links are shaped as:

```text
/invitations/:invitationId
```

The route:

- redirects anonymous users to login with a redirect query
- tries to resolve public invitation details using candidate organization IDs
- blocks action when a resolved invite belongs to a different email
- allows accept or reject through authenticated endpoints

Known constraint:

The public details endpoint is:

```text
GET /organizations/:organizationId/invitations/:invitationId
```

Links with only `invitationId` may not have enough information to display full details before action.

## Styling And Theming

Global styles live in:

```text
src/assets/index.css
```

Tailwind is configured through the Vite plugin and CSS variables. There is no separate `tailwind.config.js`.

Do not create another global CSS file for theme tokens.

## Docker

The production image is built with Bun and serves the compiled SPA with `docker/serve.ts`.

```bash
docker compose up -d --build
```

Build-time args:

- `VITE_APP_NAME`
- `VITE_API_BASE_URL`

Runtime:

- container port `80`
- host port from `HOST_PORT` (default `5173`)

The Docker build uses a multi-stage `Dockerfile`:

1. `deps` — `bun install --frozen-lockfile`
2. `build` — `bun run build`
3. `production` — Bun static server for `dist/`

`docker/serve.ts` handles static assets, gzip, cache headers for hashed assets, and SPA fallback to `index.html`.

## Git Workflow

Default workflow:

```bash
git status --short --branch
git switch -c feature/<short-description>
bun run build
```

Keep feature branches named `feature/...` unless the user asks otherwise.

## Verification Checklist

Before final response:

- Run `bun run build` when code or docs that affect imports/metadata changed.
- Confirm `git status --short --branch`.
- Restore generated `tsconfig.tsbuildinfo` if needed.
- Mention skipped checks clearly.

## Known Gaps

- No frontend unit test runner is configured yet.
- Build warnings from `@vueuse/core` about `#__PURE__` comments are dependency warnings and currently non-blocking.
- Several UI components are local shadcn-vue source files; update them carefully and avoid overwriting local changes blindly.
