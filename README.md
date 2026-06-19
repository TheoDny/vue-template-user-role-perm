# Vue Organization Administration

Vue 3 administration interface for a NestJS Better Auth API with organization-scoped roles, members, invitations, permissions, and account security tools.

## Stack

- Vue 3 with `<script setup lang="ts">`
- Vite 6
- TypeScript
- Vue Router 5
- Pinia
- Tailwind CSS 4
- shadcn-vue / Reka UI components
- lucide-vue icons
- vue-sonner toasts
- pnpm

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Default local URLs:

```text
Frontend: http://localhost:5173
API:      http://localhost:3000
```

Required environment values:

```env
VITE_APP_NAME="Template User Role Perm"
VITE_API_BASE_URL=http://localhost:3000
```

`VITE_API_BASE_URL` is used by the shared API client for Nest routes such as `/auth/session`, `/roles`, `/members`, and `/invitations`.

`VITE_BETTER_AUTH_BASE_PATH` is used for native Better Auth plugin routes, currently the email OTP password reset endpoint `/api/auth/email-otp/reset-password`.

## Commands

```bash
pnpm dev
pnpm build
pnpm preview
```

`pnpm build` runs `vue-tsc -b` and then `vite build`.

## Features

- Email/password login.
- Email OTP login.
- Authenticated app shell with shadcn-vue sidebar.
- Permission-driven administration navigation.
- Active organization switcher.
- Account page with profile, assigned roles, granted permissions, OTP password reset, and session revocation.
- Public invitation response route at `/invitations/:invitationId`.
- Role administration: list, create, rename, update permissions, delete.
- Member administration: list, update roles, remove.
- Invitation administration: list, create, resend, update roles, cancel.
- Shared confirmation dialog component for destructive or irreversible actions.

## Routes

| Path                         | Purpose                                                      | Guard                                        |
| ---------------------------- | ------------------------------------------------------------ | -------------------------------------------- |
| `/login`                     | Login with OTP or password                                   | Guest only                                   |
| `/`                          | Redirect to first allowed admin section                      | Authenticated                                |
| `/account`                   | Current user profile, security, sessions, roles, permissions | Authenticated                                |
| `/admin/roles`               | Role administration                                          | `ac:read`                                    |
| `/admin/members`             | Member administration                                        | `member:read`                                |
| `/admin/invitations`         | Invitation administration                                    | `invitation:read`                            |
| `/invitations/:invitationId` | Accept or reject an organization invitation                  | Public entry, redirects to login when needed |
| `/access-denied`             | Missing permission state                                     | Authenticated                                |

## Architecture

```text
src/
  assets/          Tailwind v4 theme and global styles
  components/
    account/       Account page cards
    auth/          Login card
    common/        Reusable cross-feature components
    invitations/   Invitation administration panels/dialogs
    layout/        App shell
    members/       Member administration panels
    roles/         Role administration panels/dialogs
    sidebar/       App sidebar, organization switcher, user menu
    ui/            Local shadcn-vue components
  composables/     Route-level feature state
  lib/             Small helpers and static navigation definitions
  router/          Vue Router routes and guards
  services/        API communication modules
  stores/          Pinia stores
  types/           Domain and API contracts
  views/           Route views
```

### State

`useSessionStore` is the only Pinia store. It owns:

- current session
- current user
- organizations
- active organization
- roles
- permissions
- permission checks

Feature state for roles, members, invitations, and account UI stays in composables or route components.

### Services

All HTTP calls go through `apiRequest` in `src/services/api.service.ts`.

The API client:

- prefixes relative paths with `VITE_API_BASE_URL`
- sends `credentials: "include"`
- parses JSON or text responses
- normalizes failed responses into `ApiError`

No Vue component should call `fetch` directly.

## Main API Usage

Authentication and session:

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

## Invitation Links

The app supports links like:

```text
http://localhost:5173/invitations/<invitationId>
```

When the visitor is not authenticated, the route redirects to:

```text
/login?redirect=/invitations/<invitationId>
```

When the visitor is authenticated, the page tries to load public invitation details. The public detail API requires both `organizationId` and `invitationId`, so the frontend tries these organization candidates:

1. `?organizationId=...` from the URL query
2. the active organization
3. each organization in the current session

If details cannot be resolved, the user can still attempt accept or reject with the authenticated session. Email mismatch detection depends on resolved public invitation details.

## UI Conventions

- Use existing shadcn-vue components from `src/components/ui` before adding custom markup.
- Use semantic Tailwind tokens such as `bg-background`, `text-muted-foreground`, `border-border`, and component variants.
- Use `gap-*` for layout spacing.
- Use lucide icons for icon buttons and commands.
- Use `ConfirmDialog` from `src/components/common/ConfirmDialog.vue` for confirmation flows.
- Keep administration screens dense, direct, and operational.
- Do not put business API calls directly in components when a service or composable already owns that domain.

## Known Notes

- `createInvitation` currently sends `resend: true` to make repeated invite attempts resend existing pending invitations when the backend supports it.
- The public invitation detail route needs `organizationId`; invitation emails that only contain `invitationId` may not show all invitation details before accept/reject.
- Build output may include Rollup warnings about `#__PURE__` comments in `@vueuse/core`; these warnings come from dependencies and do not currently fail the build.

## Verification

Before handing off changes, run:

```bash
pnpm build
```

There is no dedicated test runner configured in this frontend yet. Recommended future coverage:

- API service tests with mocked `fetch`
- route guard tests
- session store tests
- role parsing helper tests
- account session and password reset component tests
