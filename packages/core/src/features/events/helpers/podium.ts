import type { OrganisationType } from '../../../prisma/generated/enums.ts'
import type { PodiumCategory, PodiumItem } from '../types/podium.ts'

export const ORGANISATION_TYPE_TO_CATEGORY: Partial<
  Record<OrganisationType, PodiumCategory>
> = {
  company: 'companies',
  association: 'associations',
  universityOrSchool: 'education',
  publicOrRegionalAuthority: 'public-services',
}

export function organisationTypeToCategory(
  type: OrganisationType
): PodiumCategory {
  return ORGANISATION_TYPE_TO_CATEGORY[type] ?? 'all'
}

// Filter podium items by category and re-rank them 1..n for display.
export function filterAndRankPodiumItems(
  items: PodiumItem[],
  activeFilter: PodiumCategory
): PodiumItem[] {
  const filtered =
    activeFilter === 'all'
      ? items
      : items.filter((item) => item.category === activeFilter)

  return filtered.map((item, index) => ({ ...item, rank: index + 1 }))
}
