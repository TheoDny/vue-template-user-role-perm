# ============================================================
# Base
# ============================================================
FROM oven/bun:1-alpine AS base

WORKDIR /app


# ============================================================
# Dependencies
# ============================================================
FROM base AS deps

COPY package.json bun.lock ./

RUN bun install --frozen-lockfile


# ============================================================
# Build
# ============================================================
FROM base AS build

COPY --from=deps /app/node_modules ./node_modules

COPY package.json bun.lock ./
COPY index.html ./
COPY vite.config.ts ./
COPY tsconfig*.json ./
COPY src ./src

ARG VITE_APP_NAME
ARG VITE_API_BASE_URL

ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN bun run build


# ============================================================
# Production (Bun static server)
# ============================================================
FROM oven/bun:1-alpine AS production

WORKDIR /app

COPY docker/serve.ts ./
COPY --from=build /app/dist ./dist

ENV PORT=80
ENV HOST=0.0.0.0
ENV DIST_DIR=./dist

EXPOSE 80

HEALTHCHECK --interval=1m --timeout=10s --retries=3 \
    CMD bun -e "fetch('http://127.0.0.1/').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["bun", "run", "serve.ts"]
