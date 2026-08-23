# ============================================================
# Base
# ============================================================
FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable \
    && corepack prepare pnpm --activate

WORKDIR /app


# ============================================================
# Dependencies
# ============================================================
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install --frozen-lockfile


# ============================================================
# Build
# ============================================================
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY src ./src

ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN pnpm build


# ============================================================
# Production (nginx)
# ============================================================
FROM nginx:1.27-alpine AS production

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=1m --timeout=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1/ > /dev/null || exit 1
