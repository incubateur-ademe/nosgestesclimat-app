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

export const findGroupById = async (id: string): Promise<Group | null> => {
  const row = await prisma.group.findUnique({
    where: { id },
    select: groupSelect,
  })

  return row ? toGroup(row) : null
}
