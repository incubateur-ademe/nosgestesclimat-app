#!/bin/sh

corepack enable
corepack install
pnpm install
pnpm -r generate
pnpm -F core db:deploy
