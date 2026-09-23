import type {
  Organisation,
  OrganisationType,
} from '../../../prisma/generated/client.js'
import type { PodiumCategory, PodiumItem } from '../types/event-info.ts'

export interface EventComputationRow {
  simulationsCount: number
  organisation: Pick<Organisation, 'id' | 'name' | 'slug' | 'type'> | null
}

export const ORGANISATION_CATEGORY_TO_TYPE: Record<
  PodiumCategory,
  OrganisationType | null
> = {
  all: null,
  companies: 'company',
  associations: 'association',
  education: 'universityOrSchool',
  'public-services': 'publicOrRegionalAuthority',
}

export function mapEventComputationToPodiumItem({
  row,
  type,
}: {
  row: EventComputationRow
  type: PodiumCategory
}): PodiumItem | null {
  if (!row.organisation) return null
  return {
    id: row.organisation.id,
    name: row.organisation.name,
    slug: row.organisation.slug,
    type,
    simulationsCount: row.simulationsCount,
  }
}
