import { PrismaClient } from '@nosgestesclimat/core/prisma/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

// Scalingo PostgreSQL uses self-signed certificates.
// Replace sslmode in the connection string with no-verify to accept them.
const connectionString = (process.env.DATABASE_URL || '').replace(
  /sslmode=[^&]*/g,
  'sslmode=no-verify'
)

const adapter = new PrismaPg({
  connectionString,
})
export const prisma = new PrismaClient({ adapter })
