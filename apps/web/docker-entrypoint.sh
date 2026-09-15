#!/bin/sh
set -e

echo "Running prisma db push..."
npx prisma@5.22.0 db push --schema=./prisma/schema.prisma 2>&1 || echo "WARNING: prisma db push failed, continuing anyway"

echo "Starting server..."
exec node server.js
