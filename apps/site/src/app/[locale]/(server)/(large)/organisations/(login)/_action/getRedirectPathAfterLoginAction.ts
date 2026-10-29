import { getUserOrganisation } from '@/helpers/server/model/organisations'

export async function getRedirectPathAfterLogin(): Promise<string> {
  'use server'
  const organisation = await getUserOrganisation()
  return organisation
    ? `/organisations/${organisation.slug}`
    : '/organisations/creer'
}
