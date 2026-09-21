import type { OrganisationType } from '../../../prisma/generated/enums.ts'

export const ADEME_SLUG = 'ademe'

export const MOBILISED_ORGANISATION_MIN_SIMULATIONS = 3

export const PODIUM_LIMIT_PER_TYPE = 15

export const PODIUM_ORGANISATION_TYPES: OrganisationType[] = [
  'company',
  'association',
  'universityOrSchool',
  'publicOrRegionalAuthority',
  'other',
]
