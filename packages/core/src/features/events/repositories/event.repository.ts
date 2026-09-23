import { prisma } from '../../../prisma/client.ts'
import {
  ADEME_SLUG,
  MOBILISED_ORGANISATION_MIN_SIMULATIONS,
  PODIUM_CATEGORIES,
  PODIUM_LIMIT_PER_TYPE,
} from '../constants/podium.ts'
import type { PodiumCategory, PodiumItem } from '../types/event-info.ts'
import {
  mapEventComputationToPodiumItem,
  ORGANISATION_CATEGORY_TO_TYPE,
} from './event.mapper.ts'

export const findEvent = async (eventIdOrSlug: string) =>
  prisma.event.findFirst({
    where: { OR: [{ id: eventIdOrSlug }, { slug: eventIdOrSlug }] },
    select: { id: true, name: true, startDate: true, endDate: true },
  })

export const findPodiumOrganisations = async (
  eventId: string
): Promise<Record<PodiumCategory, PodiumItem[]>> => {
  const buildEventComputationRequest = (type: PodiumCategory) => {
    const organisationType = ORGANISATION_CATEGORY_TO_TYPE[type]
    return prisma.eventComputation.findMany({
      where: {
        eventId,
        simulationsCount: { gte: MOBILISED_ORGANISATION_MIN_SIMULATIONS },
        organisation: {
          slug: {
            not: {
              equals: ADEME_SLUG,
            },
          },
          ...(organisationType ? { type: organisationType } : {}),
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
  }

  return Object.fromEntries(
    await Promise.all(
      PODIUM_CATEGORIES.map(async (type) => [
        type,
        (await buildEventComputationRequest(type))
          .map((row) =>
            mapEventComputationToPodiumItem({
              row,
              type,
            })
          )
          .filter((row) => row !== null),
      ])
    )
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
