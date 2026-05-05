#!/bin/sh

corepack enable
corepack install
pnpm install
pnpm -F server db:migrate
