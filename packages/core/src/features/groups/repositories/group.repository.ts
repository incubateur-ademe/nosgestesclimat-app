import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import type { Group } from '../types/group.ts'
import { toGroup } from './group.mapper.ts'

const groupSelect = {
  id: true,
  name: true,
  emoji: true,
  administrator: { select: { userId: true } },
  createdAt: true,
  updatedAt: true,
} as const

export const findGroupById = async (id: string): Promise<Group | null> => {
  const row = await prisma.group.findUnique({
    where: { id },
    select: groupSelect,
  })

  return row ? toGroup(row) : null
}

/**
 * Return groups sorted by most recent participation
 */
export const findManyGroupsBySimulationId = async ({
  simulationId,
}: {
  simulationId: string
}): Promise<Group[]> => {
  const groupParticipants = await prisma.groupParticipant.findMany({
    where: {
      simulationId,
    },
    orderBy: { createdAt: 'desc' },
    select: { group: { select: groupSelect } },
  })
  return groupParticipants.map((gp) => toGroup(gp.group))
}

/** Deletes the groups the user administers; their participants go with them. */
export const deleteGroupsAdministeredByUser = async (
  { userId }: { userId: string },
  { session = prisma }: { session?: Transaction } = {}
): Promise<void> => {
  await session.group.deleteMany({
    where: { administrator: { is: { userId } } },
  })
}

/** Removes the user from the groups they only take part in. */
export const deleteGroupParticipationsForUser = async (
  { userId }: { userId: string },
  { session = prisma }: { session?: Transaction } = {}
): Promise<void> => {
  await session.groupParticipant.deleteMany({ where: { userId } })
}
