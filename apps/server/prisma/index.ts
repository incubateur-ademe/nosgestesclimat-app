import { PrismaPg } from '@prisma/adapter-pg'
import { redis } from '../src/adapters/redis/client.js'
import { PrismaClient } from './generated/prisma/client.js'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})
const prisma = new PrismaClient({ adapter })

const main = async () => {
  // Order matters here
  const scripts = [
    await import('./scripts/grant-roles.js'),
    await import('./scripts/add-integrations-api-scopes.js'),
    await import('./scripts/add-integrations-email-whitelist.js'),
    await import('./scripts/geolocation-sorted-ips.js'),
    await import('./scripts/geolocation-countries.js'),
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
