import type { OrganisationType } from '../../../prisma/generated/enums.ts'
import type { ORGANISATION_FILTER_ALL } from '../constants/podium.ts'

export type PodiumOrganisationType = Extract<
  OrganisationType,
  'company' | 'association' | 'universityOrSchool' | 'publicOrRegionalAuthority'
>

export type ExtendedPodiumOrganisationType =
  | PodiumOrganisationType
  | typeof ORGANISATION_FILTER_ALL

export interface EventOrganisation {
  id: string
  name: string
  slug: string
  type: ExtendedPodiumOrganisationType
  simulationsCount: number
}

export interface EventInfo {
  organisationsPodiumByType: Record<
    ExtendedPodiumOrganisationType,
    EventOrganisation[]
  >
  totalSimulations: number
  organisationCount: number
  startDate: Date
  endDate: Date
}
