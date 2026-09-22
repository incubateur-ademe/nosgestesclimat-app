import { prisma } from '../../../prisma/client.ts'
import type { OrganisationType } from '../../../prisma/generated/enums.ts'
import {
  ADEME_SLUG,
  MOBILISED_ORGANISATION_MIN_SIMULATIONS,
  ORGANISATION_FILTER_ALL,
  PODIUM_LIMIT_PER_TYPE,
  PODIUM_ORGANISATION_TYPES,
} from '../constants/podium.ts'
import type {
  EventOrganisation,
  ExtendedPodiumOrganisationType,
} from '../types/event-info.ts'
import {
  mapEventComputationToOrganisation,
  type EventComputationRow,
} from './event.mapper.ts'

export const findEvent = async (eventIdOrSlug: string) =>
  prisma.event.findFirst({
    where: { OR: [{ id: eventIdOrSlug }, { slug: eventIdOrSlug }] },
    select: { id: true, name: true, startDate: true, endDate: true },
  })

export const findPodiumOrganisations = async (
  eventId: string
): Promise<Record<ExtendedPodiumOrganisationType, EventOrganisation[]>> => {
  const buildEventComputationRequest = (type: OrganisationType | null) =>
    prisma.eventComputation.findMany({
      where: {
        eventId,
        simulationsCount: { gte: MOBILISED_ORGANISATION_MIN_SIMULATIONS },
        organisation: {
          slug: {
            not: {
              equals: ADEME_SLUG,
            },
          },
          ...(type ? { type } : {}),
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

  // Null value allows us to get the "all" filtered organisations
  const EXTENDED_PODIUM_ORGANISATION_TYPES = [
    null,
    ...PODIUM_ORGANISATION_TYPES,
  ]

  const eventComputations = await Promise.all(
    EXTENDED_PODIUM_ORGANISATION_TYPES.map((type) =>
      buildEventComputationRequest(type)
    )
  )
  return EXTENDED_PODIUM_ORGANISATION_TYPES.reduce(
    (acc, type, index) => {
      // Is "all" filter row (not filtered by type)
      if (!type)
        return {
          ...acc,
          [ORGANISATION_FILTER_ALL]: eventComputations[index]
            .filter((row) => row.organisation !== null)
            .map((row) =>
              mapEventComputationToOrganisation({
                row: row as EventComputationRow,
                type: ORGANISATION_FILTER_ALL,
              })
            ),
        }

      return {
        ...acc,
        [type]: eventComputations[index]
          .filter((row) => row.organisation !== null)
          .map((row) =>
            mapEventComputationToOrganisation({
              row: row as EventComputationRow,
              type,
            })
          ),
      }
    },
    {} as Record<ExtendedPodiumOrganisationType, EventOrganisation[]>
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
