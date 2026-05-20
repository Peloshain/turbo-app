#!/bin/sh
set -e
npx prisma migrate deploy --schema=/app/packages/db/prisma/schema.prisma
npx prisma migrate deploy --schema=/app/packages/db/prisma/auth.prisma
exec node /app/apps/server/dist/index.js