FROM node:20-alpine AS base
WORKDIR /workspace
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile=false

FROM base AS build
COPY --from=deps /workspace/node_modules ./node_modules
COPY --from=deps /workspace/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /workspace/apps/api/node_modules ./apps/api/node_modules
COPY tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
WORKDIR /workspace/apps/api
RUN pnpm prisma generate
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /workspace/apps/api/dist ./dist
COPY --from=build /workspace/apps/api/node_modules ./node_modules
COPY --from=build /workspace/apps/api/prisma ./prisma
COPY --from=build /workspace/apps/api/package.json ./package.json
COPY --from=build /workspace/packages/shared ./packages/shared
EXPOSE 3333
CMD ["node", "dist/server.js"]
