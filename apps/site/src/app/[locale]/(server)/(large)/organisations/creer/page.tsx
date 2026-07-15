import {
  COLLECTIVE_TEST_CONNEXION_PATH,
  COLLECTIVE_TEST_INFORMATIONS_PATH,
  COLLECTIVE_TEST_ORGANISATION_PATH,
} from '@/constants/urls/paths'
import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { requireAuthUser } from '@/services/auth/require-auth-user'
import { redirect } from 'next/navigation'

export default async function CreationPage() {
  await requireAuthUser({ redirect: COLLECTIVE_TEST_CONNEXION_PATH })

  const userOrganisation = await getUserOrganisation()
  if (userOrganisation) {
    redirect(COLLECTIVE_TEST_INFORMATIONS_PATH)
  }

  redirect(COLLECTIVE_TEST_ORGANISATION_PATH)
}
