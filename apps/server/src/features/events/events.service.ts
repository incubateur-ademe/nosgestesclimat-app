import { prisma } from '@nosgestesclimat/core/prisma/client'

export interface EventPollInfo {
  pollId: string
  nbSimulations: number
}

export interface EventInfo {
  polls: EventPollInfo[]
  totalSimulations: number
}

export const getEventInfo = async (eventId: string): Promise<EventInfo> => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { startDate: true, endDate: true },
  })

  if (!event) {
    return { polls: [], totalSimulations: 0 }
  }

  const [polls, totalResult] = await Promise.all([
    prisma.$queryRawUnsafe<
      { eventId: string; pollId: string; nbSimulations: number }[]
    >(
      `SELECT "eventId", "pollId", "nbSimulations"
       FROM "ngc"."event_computation"
       WHERE "eventId" = $1
       ORDER BY "nbSimulations" DESC
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
  ])

  return {
    polls: polls.map((p) => ({
      pollId: p.pollId,
      nbSimulations: p.nbSimulations,
    })),
    totalSimulations: totalResult[0]?.count ?? 0,
  }
}
