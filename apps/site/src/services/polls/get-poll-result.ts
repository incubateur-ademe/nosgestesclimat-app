'use server'

import { isOrganisationAdministrator } from '@nosgestesclimat/core/features/organisations/services/is-organisation-administrator.service'
import {
  getPollResult as getPollResultService,
  type PollResult,
} from '@nosgestesclimat/core/features/polls/services/get-poll-result.service'

import { getUserSession } from '@/services/auth/get-user-session'
import { notFound } from 'next/navigation'

/**
 * Everything the poll result page shows, plus whether its viewer administrates
 * the organisation.
 *
 * The core use case never learns who is looking — only `userId` crosses the
 * boundary — so the organisation right is asked separately, and only for a
 * signed-in viewer: an anonymous session has no email to look an administrator
 * up with.
 */
export const getPollResult = async ({
  organisationSlug,
  pollIdOrSlug,
}: {
  organisationSlug: string
  pollIdOrSlug: string
}): Promise<PollResult & { isAdmin: boolean }> => {
  const session = await getUserSession()

  const [result, isAdmin] = await Promise.all([
    getPollResultService({
      organisationSlug,
      pollIdOrSlug,
      userId: session?.id ?? null,
    }),
    session?.isAuth
      ? isOrganisationAdministrator({
          organisationSlug,
          userEmail: session.email,
        })
      : false,
  ])

  if (!result) notFound()

  return { ...result, isAdmin }
}
