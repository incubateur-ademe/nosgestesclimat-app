import { prisma } from '../../../prisma/client.ts'
import {
  ADEME_SLUG,
  MOBILISED_ORGANISATION_MIN_SIMULATIONS,
  PODIUM_LIMIT_PER_TYPE,
} from '../constants/podium.ts'
import type { EventOrganisation } from '../types/event-info.ts'
import { mapEventComputationToOrganisation } from './event.mapper.ts'

export const findEvent = async (eventIdOrSlug: string) =>
  prisma.event.findFirst({
    where: { OR: [{ id: eventIdOrSlug }, { slug: eventIdOrSlug }] },
    select: { id: true, name: true, startDate: true, endDate: true },
  })

export const findPodiumOrganisations = async (
  eventId: string
): Promise<EventOrganisation[]> => {
  const filteredEventComputations = await prisma.eventComputation.findMany({
    where: {
      eventId,
      simulationsCount: { gte: MOBILISED_ORGANISATION_MIN_SIMULATIONS },
      NOT: {
        organisation: {
          slug: {
            contains: ADEME_SLUG,
          },
        },
      },
    },
    include: {
      organisation: {
        select: { id: true, name: true, slug: true, type: true },
      },
    },
    orderBy: [{ simulationsCount: 'desc' }, { organisationId: 'asc' }],
    take: PODIUM_LIMIT_PER_TYPE,
  })

  return filteredEventComputations.map((row) =>
    mapEventComputationToOrganisation({
      simulationsCount: row.simulationsCount,
      organisation: row.organisation!,
    })
  )
}

export const countEventSimulations = async (
  eventId: string
): Promise<number> => {
  const total = await prisma.eventComputation.findFirst({
    where: { eventId, organisationId: null },
    select: { simulationsCount: true },
  })
  return total?.simulationsCount ?? 0
}

export const countMobilisedOrganisations = async (
  eventId: string
): Promise<number> =>
  prisma.eventComputation.count({
    where: {
      eventId,
      simulationsCount: { gte: MOBILISED_ORGANISATION_MIN_SIMULATIONS },
      organisationId: { not: null },
    },
  })

export const refreshEventComputation = () =>
  prisma.$executeRawUnsafe(
    'REFRESH MATERIALIZED VIEW CONCURRENTLY "ngc"."event_computation"'
  )
