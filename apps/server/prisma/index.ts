import { PrismaClient } from '@nosgestesclimat/core/prisma/generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { redis } from '../src/adapters/redis/client.ts'

// Scalingo PostgreSQL uses self-signed certificates.
// Replace sslmode in the connection string with no-verify to accept them.
const connectionString = (process.env.DATABASE_URL || '').replace(
  /sslmode=[^&]*/g,
  'sslmode=no-verify'
)

const adapter = new PrismaPg({
  connectionString,
})
const prisma = new PrismaClient({ adapter })

const main = async () => {
  // Order matters here
  const scripts = [
    await import('./scripts/grant-roles.ts'),
    await import('./scripts/add-integrations-api-scopes.ts'),
    await import('./scripts/add-integrations-email-whitelist.ts'),
    await import('./scripts/geolocation-sorted-ips.ts'),
    await import('./scripts/geolocation-countries.ts'),
  ]

  try {
    await redis.connect()
    for (const script of scripts) {
      await script.exec({ prisma, redis })
    }
    process.exit(0)
  } catch (err) {
    console.error('Post-migrate script failed', err)
    process.exit(1)
  }
}

main()
