import type { PollMode } from '../../../prisma/generated/client.ts'
import type { Poll } from '../types/poll.ts'

export interface PollRow {
  id: string
  name: string
  slug: string
  mode: PollMode
  organisationId: string
  expectedNumberOfParticipants: number | null
  createdAt: Date
  updatedAt: Date
  organisation: {
    id: string
    name: string
    slug: string
  }
}

export const toPoll = (row: PollRow): Poll => {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    mode: row.mode,
    expectedNumberOfParticipants: row.expectedNumberOfParticipants,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    organisation: row.organisation,
  }
}
