import { prisma } from '../../../prisma/client.ts'

export interface EventOrganisation {
  id: string
  name: string
  slug: string
  type: string
  simulationsCount: number
}

export interface EventInfo {
  organisations: EventOrganisation[]
  totalSimulations: number
  organisationCount: number
}

export async function getEventInfo(eventId: string): Promise<EventInfo> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { startDate: true, endDate: true },
  })

  if (!event) {
    return { organisations: [], totalSimulations: 0, organisationCount: 0 }
  }

  const [rows, totalResult, orgCountResult] = await Promise.all([
    prisma.$queryRawUnsafe<
      { organisationId: string; simulationsCount: number }[]
    >(
      `SELECT ec."organisationId", ec."simulationsCount"
       FROM "ngc"."event_computation" ec
       WHERE ec."eventId" = $1
       ORDER BY ec."simulationsCount" DESC
       LIMIT 15`,
      eventId
    ),
    prisma.$queryRawUnsafe<{ count: number }[]>(
      `SELECT COUNT(*)::INTEGER AS "count"
       FROM "ngc"."Simulation"
       WHERE "createdAt" >= $1 AND "createdAt" <= $2`,
      event.startDate,
      event.endDate
    ),
    prisma.$queryRawUnsafe<{ count: number }[]>(
      `SELECT COUNT(*)::INTEGER AS "count"
       FROM "ngc"."event_computation" ec
       WHERE ec."eventId" = $1 AND ec."simulationsCount" > 0
         AND ec."organisationId" NOT IN (
           SELECT o."id" FROM "ngc"."Organisation" o WHERE o."slug" = $2
         )`,
      eventId,
      'ademe-SEDD'
    ),
  ])

  const orgIds = rows.map((r) => r.organisationId)

  const orgInfos: Map<string, { name: string; slug: string; type: string }> =
    new Map()

  if (orgIds.length > 0) {
    const orgs = await prisma.organisation.findMany({
      where: { id: { in: orgIds } },
      select: { id: true, name: true, slug: true, type: true },
    })
    for (const org of orgs) {
      orgInfos.set(org.id, {
        name: org.name,
        slug: org.slug,
        type: org.type,
      })
    }
  }

  return {
    organisations: rows
      .map((row) => {
        const info = orgInfos.get(row.organisationId)
        if (!info || info.slug === 'ademe-SEDD') return null
        return {
          id: row.organisationId,
          name: info.name,
          slug: info.slug,
          type: info.type,
          simulationsCount: row.simulationsCount,
        }
      })
      .filter((o): o is EventOrganisation => o !== null),
    totalSimulations: totalResult[0]?.count ?? 0,
    organisationCount: orgCountResult[0]?.count ?? 0,
  }
}
