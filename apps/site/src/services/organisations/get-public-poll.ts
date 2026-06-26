'use server'

import { ORGANISATION_URL } from '@/constants/urls/main'
import { fetchServer } from '@/helpers/server/fetchServer'
import { getUserSession } from '@/services/auth/get-user-session'
import type { PublicOrganisationPoll } from '@/types/organisations'

/**
 * Nil UUID utilisé quand l'utilisateur n'a pas de session.
 *
 * La route Express `GET /v1/:userId/public-polls/:slug` exige un UUID valide
 * dans l'URL (`v.uuid()`), mais le handler est read-only et tolère les
 * visiteurs non authentifiés (`passIfUnauthorized: true`).
 *
 * En l'absence de session, on passe ce UUID factice : il satisfait la
 * validation sans matcher aucun utilisateur réel côté base, ce qui retourne
 * simplement le poll sans données utilisateur spécifiques.
 */
const NO_SESSION_USER_ID = '00000000-0000-0000-0000-000000000000'

export const getPublicPoll = async (
  pollIdOrSlug: string
): Promise<PublicOrganisationPoll> => {
  const session = await getUserSession()

  return fetchServer<PublicOrganisationPoll>(
    `${ORGANISATION_URL}/${session?.id ?? NO_SESSION_USER_ID}/public-polls/${pollIdOrSlug}`
  )
}
