import type { OrganisationType } from '../../../prisma/generated/enums.ts'

// Organisation ADEME used to collect individual simulations coming through the
// landing page: excluded from the podium, but its simulations still count for
// the total counter.
export const ADEME_SEDD_SLUG = 'ademe-sedd'

// Podium size: the best organisations per type.
export const PODIUM_LIMIT_PER_TYPE = 15

// Organisation types competing in the podium, one category per type.
export const PODIUM_ORGANISATION_TYPES: OrganisationType[] = [
  'company',
  'association',
  'universityOrSchool',
  'publicOrRegionalAuthority',
]
