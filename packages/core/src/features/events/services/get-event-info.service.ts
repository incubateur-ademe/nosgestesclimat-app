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
  startDate: Date | null
  endDate: Date | null
}

// Organisation ADEME used to collect individual simulations coming through the
// landing page: it must be excluded from the podium (and from the mobilised
// organisations count), but its simulations still count for the counter.
const ADEME_SEDD_SLUG = 'ademe-sedd'

// Podium size per organisation type (kanban card: "15 par type d'orga").
const PODIUM_LIMIT_PER_TYPE = 15

export async function getEventInfo(eventIdOrSlug: string): Promise<EventInfo> {
  const event = await prisma.event.findFirst({
    where: { OR: [{ id: eventIdOrSlug }, { slug: eventIdOrSlug }] },
    select: { id: true, startDate: true, endDate: true },
  })

  if (!event) {
    return {
      organisations: [],
      totalSimulations: 0,
      organisationCount: 0,
      startDate: null,
      endDate: null,
    }
  }

  const [rows, totalResult, orgCountResult] = await Promise.all([
    // Top 15 per organisation type, ADEME excluded.
    prisma.$queryRawUnsafe<
      { organisationId: string; simulationsCount: number }[]
    >(
      `WITH ranked AS (
         SELECT
           ec."organisationId",
           ec."simulationsCount",
           ROW_NUMBER() OVER (
             PARTITION BY o."type"
             ORDER BY ec."simulationsCount" DESC, o."name" ASC
           ) AS rn
         FROM "ngc"."event_computation" ec
         JOIN "ngc"."Organisation" o ON o.id = ec."organisationId"
         WHERE ec."eventId" = $1
           AND ec."organisationId" IS NOT NULL
           AND o."slug" <> $2
       )
       SELECT "organisationId", "simulationsCount"
       FROM ranked
       WHERE rn <= $3
       ORDER BY "simulationsCount" DESC`,
      event.id,
      ADEME_SEDD_SLUG,
      PODIUM_LIMIT_PER_TYPE
    ),
    // Total counter comes from the total row (organisationId IS NULL) of the
    // materialized view, which already filters completed simulations in the
    // event window.
    prisma.$queryRawUnsafe<{ count: number }[]>(
      `SELECT ec."simulationsCount" AS "count"
       FROM "ngc"."event_computation" ec
       WHERE ec."eventId" = $1 AND ec."organisationId" IS NULL`,
      event.id
    ),
    // Mobilised organisations: at least 2 completed simulations, ADEME excluded.
    prisma.$queryRawUnsafe<{ count: number }[]>(
      `SELECT COUNT(*)::INTEGER AS "count"
       FROM "ngc"."event_computation" ec
       WHERE ec."eventId" = $1
         AND ec."simulationsCount" >= 2
         AND ec."organisationId" IS NOT NULL
         AND ec."organisationId" NOT IN (
           SELECT o."id" FROM "ngc"."Organisation" o WHERE o."slug" = $2
         )`,
      event.id,
      ADEME_SEDD_SLUG
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
        if (!info || info.slug === ADEME_SEDD_SLUG) return null
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
    startDate: event.startDate,
    endDate: event.endDate,
  }
}
