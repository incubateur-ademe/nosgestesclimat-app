import type { Group } from '../types/group.ts'

export interface GroupRow {
  id: string
  name: string
  emoji: string
  administrator: { userId: string } | null
  createdAt: Date
  updatedAt: Date
}

export const toGroup = (row: GroupRow): Group => ({
  id: row.id,
  name: row.name,
  emoji: row.emoji,
  administratorId: row.administrator?.userId ?? null,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})
