#!/bin/sh

corepack enable
corepack install
pnpm install
pnpm -F server prebuild
pnpm -F server db:migrate
