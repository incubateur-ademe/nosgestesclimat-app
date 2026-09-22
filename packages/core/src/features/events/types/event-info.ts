import type { OrganisationType } from '../../../prisma/generated/enums.ts'
import type { PODIUM_ALL_CATEGORY } from '../constants/podium.ts'

export type PodiumOrganisationType = Extract<
  OrganisationType,
  'company' | 'association' | 'universityOrSchool' | 'publicOrRegionalAuthority'
>

export type ExtendedPodiumOrganisationType =
  | PodiumOrganisationType
  | typeof PODIUM_ALL_CATEGORY

export type PodiumCategory =
  | 'all'
  | 'companies'
  | 'associations'
  | 'education'
  | 'public-services'

export interface EventOrganisation {
  id: string
  name: string
  slug: string
  type: PodiumCategory
  simulationsCount: number
}

export interface EventInfo {
  organisationsPodiumByType: Record<PodiumCategory, EventOrganisation[]>
  totalSimulations: number
  organisationCount: number
  startDate: Date
  endDate: Date
}
