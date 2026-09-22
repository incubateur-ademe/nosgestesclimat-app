import type { Organisation } from '../../../prisma/generated/client.ts'
import type {
  EventOrganisation,
  ExtendedPodiumOrganisationType,
} from '../types/event-info.ts'

export interface EventComputationRow {
  simulationsCount: number
  organisation: Pick<Organisation, 'id' | 'name' | 'slug' | 'type'>
}

export function mapEventComputationToOrganisation({
  row,
  type,
}: {
  row: EventComputationRow
  type: ExtendedPodiumOrganisationType
}): EventOrganisation {
  return {
    id: row.organisation.id,
    name: row.organisation.name,
    slug: row.organisation.slug,
    type: type,
    simulationsCount: row.simulationsCount,
  }
}
