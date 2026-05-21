#!/bin/sh
set -e
cd /app/packages/db
npx prisma migrate deploy --config=prisma.config.ts
# bunx tsx prisma/seed.ts
cd /app
exec node /app/apps/server/dist/index.js