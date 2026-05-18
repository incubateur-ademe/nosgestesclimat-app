import { prisma } from '../src/adapters/prisma/client.ts'
import logger from '../src/logger.ts'

const main = async () => {
  try {
    const result = await prisma.$queryRaw<
      { count: string }[]
    >`SELECT COUNT(*)::text FROM (
      INSERT INTO ngc."User" (id, name, email, "createdAt", "updatedAt")
      SELECT vu.id, vu.name, vu.email, vu."createdAt", vu."updatedAt"
      FROM ngc."VerifiedUser" vu
      LEFT JOIN ngc."User" u ON u.id = vu.id
      WHERE u.id IS NULL
      RETURNING id
    )`

    const count = result?.[0]?.count || '0'
    logger.info('Created User records for orphaned VerifiedUsers', { count })

    const remaining = await prisma.$queryRaw<
      { count: bigint }[]
    >`SELECT COUNT(*) FROM (
      SELECT vu.id
      FROM ngc."VerifiedUser" vu
      LEFT JOIN ngc."User" u ON u.id = vu.id
      WHERE u.id IS NULL
    )`
    logger.info('Remaining orphaned VerifiedUsers after migration', {
      count: remaining?.[0]?.count?.toString() || '0',
    })

    process.exit(0)
  } catch (e) {
    logger.error(e)
    process.exit(1)
  }
}

main()
