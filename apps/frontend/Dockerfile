# syntax=docker/dockerfile:1

# ---- build stage ----
FROM node:24-alpine AS build
WORKDIR /app
# Evita o prompt interativo do corepack ao baixar o pnpm na primeira execução
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
COPY package.json pnpm-lock.yaml ./
# A versão do pnpm vem do campo "packageManager" do package.json;
# fica cacheada e é refeita só quando o manifest ou o lockfile mudam
RUN corepack enable && corepack prepare --activate
# Popula o store do pnpm apenas a partir do lockfile:
# a camada só é refeita quando as dependências mudam, não quando o código muda
RUN pnpm fetch
COPY . .
# VITE_API_URL é embutido no bundle em tempo de build:
# ambientes diferentes exigem recompilar a imagem passando --build-arg
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm install --frozen-lockfile --offline && pnpm build

# ---- production stage ----
FROM nginxinc/nginx-unprivileged:1.28-alpine
LABEL org.opencontainers.image.title="recipes-app-2/frontend" \
  org.opencontainers.image.description="SPA React + Vite servida pelo nginx-unprivileged"
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD wget -q --spider http://127.0.0.1:8080/ || exit 1
