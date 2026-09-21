import { prisma } from '../../../prisma/client.ts'
import {
  ADEME_SLUG,
  MOBILISED_ORGANISATION_MIN_SIMULATIONS,
  PODIUM_LIMIT_PER_TYPE,
  PODIUM_ORGANISATION_TYPES,
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
  const filteredEventComputations = await Promise.all(
    PODIUM_ORGANISATION_TYPES.map((type) =>
      prisma.eventComputation.findMany({
        where: {
          eventId,
          simulationsCount: { gte: MOBILISED_ORGANISATION_MIN_SIMULATIONS },
          organisation: {
            slug: {
              not: {
                startsWith: ADEME_SLUG,
              },
            },
            type,
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
    )
  )

  return filteredEventComputations
    .flat()
    .filter((row) => !!row.organisation)
    .map((row) =>
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
