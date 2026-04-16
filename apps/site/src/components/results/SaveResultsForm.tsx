'use client'

import AuthenticateUserForm from '@/components/AuthenticateUserForm'
import Trans from '@/components/translation/trans/TransClient'
import { SHOW_WELCOME_BANNER_QUERY_PARAM } from '@/constants/urls/params'
import { MON_ESPACE_PATH } from '@/constants/urls/paths'

import { UserProvider } from '@/publicodes-state'

export default function SaveResultsForm({ userId }: { userId: string }) {
  return (
    <UserProvider serverUserId={userId}>
      <div className="dark">
        <AuthenticateUserForm
          buttonColor="borderless"
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
        />
      </div>
    </UserProvider>
  )
}
