# syntax=docker/dockerfile:1

# ---- build stage ----
FROM node:24-alpine AS build
WORKDIR /app
# pnpm version is pinned via the "packageManager" field in package.json
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# ---- production stage ----
FROM node:24-alpine
ENV NODE_ENV=production \
    NODE_OPTIONS=--enable-source-maps \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0
LABEL org.opencontainers.image.title="recipes_app_2" \
      org.opencontainers.image.version="1.0"
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# --ignore-scripts: every runtime dep is pure JS; no dependency postinstall
# should ever execute inside the production image
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    corepack enable pnpm \
    && pnpm install --frozen-lockfile --prod --ignore-scripts
COPY --from=build /app/dist ./dist
# Migrations + seed run on startup via DatabaseModule
COPY --from=build /app/drizzle ./drizzle
# Static files served at /uploads by main.ts; volume-mounted at runtime
RUN mkdir /app/uploads && chown node:node /app/uploads
USER node
EXPOSE 3000
# start-period covers migrate + seed, which run before the app listens
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -q --spider "http://localhost:${PORT:-3000}/health" || exit 1
CMD ["node", "dist/main.js"]
