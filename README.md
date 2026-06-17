# Vue Organization Administration

Vue 3 administration interface for managing organization roles, members, and invitations through the NestJS Better Auth API.

## Setup

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Required environment values:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_BETTER_AUTH_BASE_PATH=/api/auth
```

## Commands

```bash
pnpm build
pnpm dev
pnpm preview
```

## Implemented Areas

- Authenticated router with route guards.
- Session-wide Pinia store through `useSessionStore`.
- Dynamic shadcn-vue sidebar based on `read` permissions.
- Organization switcher using `POST /auth/active-organization`.
- Role administration using `GET /roles`, `POST /roles`, `PATCH /roles/:roleId`, `PATCH /roles/:roleId/permissions`, and `DELETE /roles/:roleId`.
- Member administration using `GET /members`, `PATCH /members/:memberId/roles`, and `DELETE /members/:memberId`.
- Invitation administration using `GET /invitations`, `POST /invitations`, `PATCH /invitations/:invitationId/roles`, and `POST /invitations/:invitationId/cancel`.

## Architecture

Services live in `src/services/` and own API communication. Domain contracts live in `src/types/`. Feature state for roles, members, invitations, and permission catalogs lives in route-level composables rather than Pinia stores. Pinia is reserved for the authenticated session and active organization context.

The UI uses local shadcn-vue components from `src/components/ui/`.

## Git Workflow

Development is integrated through `develop`. Each implementation phase starts from `develop`, uses a `feature/...` branch, merges back to `develop`, and is tagged with `0.X.X-develop`.
