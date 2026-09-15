#!/bin/sh
set -e

echo "Installing runtime dependencies..."
npm install --production 2>/dev/null || true

echo "Running prisma db push..."
npx prisma@5.22.0 db push --schema=./prisma/schema.prisma 2>&1 || echo "WARNING: prisma db push failed, continuing anyway"

echo "Seeding database..."
npx tsx prisma/seed.ts 2>&1 || echo "WARNING: seeding failed or already done"

echo "Starting server..."
exec node server.js
