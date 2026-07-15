import { COLLECTIVE_TEST_INFORMATIONS_PATH } from '@/constants/urls/paths'
import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { requireAuthUser } from '@/services/auth/require-auth-user'
import { redirect } from 'next/navigation'
import FinalizePollCreation from '../_components/FinalizePollCreation'

export default async function CollectiveTestFinaliserPage() {
  await requireAuthUser({ redirect: COLLECTIVE_TEST_INFORMATIONS_PATH })

  const organisation = await getUserOrganisation()
  if (!organisation) {
    redirect('/organisations/creer-campagne/organisation')
  }

  return (
    <div className="mt-4 mb-16 md:mt-8">
      <FinalizePollCreation orgSlug={organisation.slug} />
    </div>
  )
}
