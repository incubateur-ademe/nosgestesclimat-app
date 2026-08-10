import type { OrganisationType } from '../../../prisma/generated/enums.ts'

// Organisation ADEME used to collect individual simulations coming through the
// landing page: excluded from the podium, but its simulations still count for
// the total counter.
export const ADEME_SEDD_SLUG = 'ademe-sedd'

// Minimum completed simulations for an organisation to be considered
// "mobilised" (podium + counter). Matches the campaign results UI, which only
// reveals stats from 3 participations (StatisticsBlocks.tsx).
export const MOBILISED_ORGANISATION_MIN_SIMULATIONS = 3

// Podium size: the best organisations per type.
export const PODIUM_LIMIT_PER_TYPE = 15

// Organisation types competing in the podium, one category per type.
export const PODIUM_ORGANISATION_TYPES: OrganisationType[] = [
  'company',
  'association',
  'universityOrSchool',
  'publicOrRegionalAuthority',
]
