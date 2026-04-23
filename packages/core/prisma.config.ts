import 'dotenv/config'
import type { PrismaConfig } from 'prisma'

export default {
  schema: 'prisma/schema',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
} satisfies PrismaConfig
