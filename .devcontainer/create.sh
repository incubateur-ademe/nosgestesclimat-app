#!/bin/sh

corepack enable
corepack install
pnpm install
pnpm -F server generate
pnpm -F server db:migrate
