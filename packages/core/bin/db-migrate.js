#!/usr/bin/env node
import { execSync } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const prismaEntry = require.resolve('prisma/build/index.js')
const config = require.resolve('../prisma.config.js')

execSync(`node ${prismaEntry} migrate deploy --config ${config}`, {
  stdio: 'inherit',
})
