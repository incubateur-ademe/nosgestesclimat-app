import { prisma } from '../../../prisma/client.ts'
import type { Group } from '../types/group.ts'
import { toGroup } from './group.mapper.ts'

export interface GroupRow {
  id: string
  name: string
  emoji: string
  administrator: { userId: string } | null
  createdAt: Date
  updatedAt: Date
}

const groupSelect = {
  id: true,
  name: true,
  emoji: true,
  administrator: { select: { userId: true } },
  createdAt: true,
  updatedAt: true,
} as const

export const findGroupsBySimulationId = async ({
  simulationId,
}: {
  simulationId: string
}): Promise<Group[]> => {
  const rows = await prisma.groupParticipant.findMany({
    where: { simulationId },
    // Oldest first: the last entry is the group the user most recently joined.
    orderBy: { createdAt: 'asc' },
    select: { group: { select: groupSelect } },
  })

  return rows.map(({ group }) => toGroup(group))
}
