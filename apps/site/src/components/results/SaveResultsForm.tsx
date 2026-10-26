'use client'

import AuthenticateUserForm from '@/components/authentication/AuthenticateUserForm'
import Trans from '@/components/translation/trans/TransClient'
import { SHOW_WELCOME_BANNER_QUERY_PARAM } from '@/constants/urls/params'
import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import { useClientTranslation } from '@/hooks/useClientTranslation'

import { UserProvider } from '@/publicodes-state'
import type { UserSession } from '@nosgestesclimat/core/features/auth/types/user-session'

export default function SaveResultsForm({
  userSession,
}: {
  userSession: UserSession
}) {
  const { t } = useClientTranslation()
  return (
    <UserProvider userSession={userSession}>
      <div className="dark">
        <AuthenticateUserForm
          intent="save-simulation"
          isVerticalLayout={false}
          buttonLabel={
            <Trans i18nKey="fin.getResultsOnUserProfile.buttonLabel">
              Sauvegarder mes résultats
            </Trans>
          }
          inputLabel={
            <span className="text-white">
              <Trans i18nKey="fin.getResultsOnUserProfile.inputLabel">
                Votre adresse e-mail
              </Trans>
            </span>
          }
          redirectPathname={`${MON_ESPACE_PATH}?${SHOW_WELCOME_BANNER_QUERY_PARAM}=true`}
          verificationClassName="p-0 md:p-0 border-t border-primary-500 rounded-none pt-6!"
          verificationButtonLabel={t(
            'save-results-form.verification.button-label',
            'Enregistrer mes résultats'
          )}
        />
      </div>
    </UserProvider>
  )
}
