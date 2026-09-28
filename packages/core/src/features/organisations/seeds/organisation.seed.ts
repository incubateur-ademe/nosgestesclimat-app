import type { OrganisationType } from '../../../prisma/generated/client.ts'
import {
  upsertOrganisationAdministrator,
  upsertOrganisationBySlug,
  type OrganisationSummary,
} from '../repositories/organisation.repository.ts'

export interface OrganisationSeedInput {
  slug: string
  name: string
  type?: OrganisationType
  administratorEmail: string
}

export interface OrganisationSeedResult {
  organisation: OrganisationSummary
}

/**
 * Seeds a demo organisation and its administrator.
 */
export const seedOrganisation = async ({
  slug,
  name,
  type,
  administratorEmail,
}: OrganisationSeedInput): Promise<OrganisationSeedResult> => {
  const organisation = await upsertOrganisationBySlug({ name, slug, type })

  await upsertOrganisationAdministrator({
    userEmail: administratorEmail,
    organisationId: organisation.id,
  })

  return { organisation }
}

/**
 * The organisation slug belonging to a demo account: one organisation per
 * `SEED_ADMIN_EMAILS` entry, derived from its email so the link between the two
 * is readable and stable.
 */
export const organisationSlugForAccount = (emailSlug: string): string =>
  `organisation-${emailSlug}`
