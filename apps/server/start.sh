#!/bin/sh
set -e
npx prisma migrate deploy --schema=../../packages/db/prisma/schema.prisma
npx prisma migrate deploy --schema=../../packages/db/prisma/auth.prisma
exec node dist/index.js