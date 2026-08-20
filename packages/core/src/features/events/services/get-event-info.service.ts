import {
  countEventSimulations,
  countMobilisedOrganisations,
  findEvent,
  findPodiumOrganisations,
} from '../repositories/event.repository.ts'
import type { EventInfo } from '../types/event-info.ts'

export const getEventInfo = async (
  eventIdOrSlug: string
): Promise<EventInfo | null> => {
  const event = await findEvent(eventIdOrSlug)

  if (!event) return null

  const [organisations, totalSimulations, organisationCount] =
    await Promise.all([
      findPodiumOrganisations(event.id),
      countEventSimulations(event.id),
      countMobilisedOrganisations(event.id),
    ])

  return {
    organisations,
    totalSimulations,
    organisationCount,
    startDate: event.startDate,
    endDate: event.endDate,
  }
}
