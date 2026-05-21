FROM node:22-alpine AS base
RUN npm i -g pnpm
WORKDIR /app

# Copy all workspace manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json ./apps/server/
COPY packages/db/package.json ./packages/db/
COPY packages/ai/package.json ./packages/ai/
COPY packages/auth/package.json ./packages/auth/
COPY packages/storage/package.json ./packages/storage/
COPY packages/api/package.json ./packages/api/
COPY packages/config/package.json ./packages/config/
COPY packages/env/package.json ./packages/env/ 

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy ALL source FIRST
COPY apps/server ./apps/server
COPY packages ./packages

# Generate AFTER source is in place
RUN pnpm --filter @repo/db exec prisma generate --config=prisma.config.ts

# Verify the generated client exists
RUN ls /app/packages/db/generated/prisma/

# Build the server
RUN pnpm --filter api add -D tsup
RUN pnpm --filter api build && ls /app/apps/server/dist

EXPOSE 3000

CMD ["sh", "/app/apps/server/start.sh"]