import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/client.ts'
import { resolvePoolOptions } from './pool-config.ts'

// Scalingo PostgreSQL uses self-signed certificates.
// Replace sslmode in the connection string with no-verify to accept them.
const connectionString = (process.env.DATABASE_URL || '').replace(
  /sslmode=[^&]*/g,
  'sslmode=no-verify'
)

const adapter = new PrismaPg(
  resolvePoolOptions({ connectionString, env: process.env })
)

export const prisma = new PrismaClient({ adapter })
