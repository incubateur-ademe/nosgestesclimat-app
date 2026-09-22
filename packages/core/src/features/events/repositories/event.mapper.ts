import type { Organisation } from '../../../prisma/generated/client.ts'
import type {
  EventOrganisation,
  ExtendedPodiumOrganisationType,
  PodiumCategory,
} from '../types/event-info.ts'

export interface EventComputationRow {
  simulationsCount: number
  organisation: Pick<Organisation, 'id' | 'name' | 'slug' | 'type'> | null
}

export const ORGANISATION_TYPE_TO_CATEGORY: Record<
  ExtendedPodiumOrganisationType,
  PodiumCategory
> = {
  all: 'all',
  company: 'companies',
  association: 'associations',
  universityOrSchool: 'education',
  publicOrRegionalAuthority: 'public-services',
}

export function mapEventComputationToOrganisation({
  row,
  type,
}: {
  row: EventComputationRow
  type: ExtendedPodiumOrganisationType
}): EventOrganisation | null {
  if (!row.organisation) return null
  return {
    id: row.organisation.id,
    name: row.organisation.name,
    slug: row.organisation.slug,
    type: ORGANISATION_TYPE_TO_CATEGORY[type],
    simulationsCount: row.simulationsCount,
  }
}
