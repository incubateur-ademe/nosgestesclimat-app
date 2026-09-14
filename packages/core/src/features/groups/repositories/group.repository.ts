import { prisma } from '../../../prisma/client.ts'
import type { Group, GroupSummary } from '../types/group.ts'
import { toGroup } from './group.mapper.ts'

const groupSelect = {
  id: true,
  name: true,
  emoji: true,
  administrator: { select: { userId: true } },
  createdAt: true,
  updatedAt: true,
} as const

const groupSummarySelect = {
  id: true,
  name: true,
} as const

export const findGroupById = async (id: string): Promise<Group | null> => {
  const row = await prisma.group.findUnique({
    where: { id },
    select: groupSelect,
  })

  return row ? toGroup(row) : null
}

export const findGroupSummaryById = async ({
  id,
}: {
  id: string
}): Promise<GroupSummary | null> => {
  return prisma.group.findUnique({
    where: { id },
    select: groupSummarySelect,
  })
}
