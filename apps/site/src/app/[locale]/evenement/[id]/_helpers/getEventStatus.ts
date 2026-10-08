import type { EventStatus } from '../_types/event'

export function getEventStatus({
  startDate,
  endDate,
}: {
  startDate: Date
  endDate: Date
}): EventStatus {
  const currentDate = new Date()

  if (currentDate < startDate) {
    return 'notStarted'
  }

  if (currentDate > endDate) {
    return 'ended'
  }

  return 'inProgress'
}
