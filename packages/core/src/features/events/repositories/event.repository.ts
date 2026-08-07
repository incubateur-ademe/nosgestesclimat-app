import { prisma } from '../../../prisma/client.ts'
import {
  ADEME_SEDD_SLUG,
  PODIUM_LIMIT_PER_TYPE,
  PODIUM_ORGANISATION_TYPES,
} from '../constants/podium.ts'
import type { EventOrganisation } from '../types/event-info.ts'

export const findEvent = async (eventIdOrSlug: string) =>
  prisma.event.findFirst({
    where: { OR: [{ id: eventIdOrSlug }, { slug: eventIdOrSlug }] },
    select: { id: true, name: true, startDate: true, endDate: true },
  })

// Podium organisations: the PODIUM_LIMIT_PER_TYPE best organisations of each
// type, ADEME excluded. Rows are globally sorted so the "all" tab can show a
// single ranking.
export const findPodiumOrganisations = async (
  eventId: string
): Promise<EventOrganisation[]> => {
  const perType = await Promise.all(
    PODIUM_ORGANISATION_TYPES.map((type) =>
      prisma.eventComputation.findMany({
        where: {
          eventId,
          organisation: { slug: { not: ADEME_SEDD_SLUG }, type },
        },
        include: {
          organisation: {
            select: { id: true, name: true, slug: true, type: true },
          },
        },
        orderBy: [{ simulationsCount: 'desc' }, { organisationId: 'asc' }],
        take: PODIUM_LIMIT_PER_TYPE,
      })
    )
  )

  return perType
    .flat()
    // The where clause requires the organisation relation, so it is never null.
    .map((row) => ({
      id: row.organisation!.id,
      name: row.organisation!.name,
      slug: row.organisation!.slug,
      type: row.organisation!.type,
      simulationsCount: row.simulationsCount,
    }))
    .sort(
      (a, b) => b.simulationsCount - a.simulationsCount || a.id.localeCompare(b.id)
    )
}

// Total counter comes from the total row (organisationId IS NULL) of the
// materialized view, which already filters completed simulations in the event
// window.
export const countEventSimulations = async (
  eventId: string
): Promise<number> => {
  const total = await prisma.eventComputation.findFirst({
    where: { eventId, organisationId: null },
    select: { simulationsCount: true },
  })
  return total?.simulationsCount ?? 0
}

// Mobilised organisations: at least 2 completed simulations.
export const countMobilisedOrganisations = async (
  eventId: string
): Promise<number> =>
  prisma.eventComputation.count({
    where: {
      eventId,
      simulationsCount: { gte: 2 },
      organisationId: { not: null },
    },
  })

// Refresh the materialized view so the counters reflect newly inserted data.
// Shared by the cron job and the test suite.
export const refreshEventComputation = () =>
  prisma.$executeRawUnsafe(
    'REFRESH MATERIALIZED VIEW CONCURRENTLY "ngc"."event_computation"'
  )
