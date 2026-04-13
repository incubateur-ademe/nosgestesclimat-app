#!/bin/sh

[ -f .devcontainer/.env ] && . .devcontainer/.env

MODE=${DEVCONTAINER_START_MODE:-development}

if [ "$MODE" = "production" ]; then
  echo "📦 Building for production..."
  NODE_ENV=production pnpm run build
  pnpm -F server db:migrate
  pnpm -F server db:post-migrate
  NODE_ENV=production pnpm run start
else
  echo "🔧 Starting in dev mode..."
  pnpm -F server build
  pnpm -F server db:migrate
  pnpm -F server db:post-migrate
  pnpm run dev
fi
