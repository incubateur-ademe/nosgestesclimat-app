import type { Group } from '../types/group.ts'
import type { GroupRow } from './group.repository.ts'

export const toGroup = (row: GroupRow): Group => ({
  id: row.id,
  name: row.name,
  emoji: row.emoji,
  administratorId: row.administrator?.userId ?? null,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
})
