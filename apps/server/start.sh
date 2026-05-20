#!/bin/sh
bunx prisma migrate deploy --schema=../../packages/db/prisma/schema.prisma
exec bun src/index.ts