import type { Transaction } from '../../../lib/transaction.ts'
import { prisma } from '../../../prisma/client.ts'
import type { OrganisationType } from '../../../prisma/generated/client.ts'

export const findOrganisationAdministrator = async ({
  userEmail,
  organisationSlug,
}: {
  userEmail: string
  organisationSlug: string
}): Promise<{ id: string } | null> =>
  prisma.organisationAdministrator.findFirst({
    where: { userEmail, organisation: { slug: organisationSlug } },
    select: { id: true },
  })

export interface OrganisationSummary {
  id: string
  name: string
  slug: string
  type: OrganisationType
}

const organisationSummarySelect = {
  id: true,
  name: true,
  slug: true,
  type: true,
} as const

export const upsertOrganisationBySlug = async (
  {
    name,
    slug,
    type = 'company',
  }: { name: string; slug: string; type?: OrganisationType },
  tx: Transaction = prisma
): Promise<OrganisationSummary> =>
  tx.organisation.upsert({
    where: { slug },
    update: {},
    create: { name, slug, type },
    select: organisationSummarySelect,
  })

export const upsertOrganisationAdministrator = async (
  { userEmail, organisationId }: { userEmail: string; organisationId: string },
  tx: Transaction = prisma
): Promise<void> => {
  await tx.organisationAdministrator.upsert({
    where: { userEmail },
    update: { organisationId },
    create: { userEmail, organisationId },
    select: { id: true },
  })
}
