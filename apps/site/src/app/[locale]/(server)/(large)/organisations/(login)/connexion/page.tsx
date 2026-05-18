import AuthenticateUserForm from '@/components/AuthenticateUserForm'
import OrganisationFilAriane from '@/components/layout/FilAriane'
import SigninSignupTabs from '@/components/signIn/SignInSignUpTabs'
import Trans from '@/components/translation/trans/TransServer'
import { SIGNIN_MODE } from '@/constants/authentication/modes'
import {
  captureOrganisationsLoginComplete,
  organisationsLoginComplete,
} from '@/constants/tracking/pages/organisationsConnexion'
import Separator from '@/design-system/layout/Separator'
import { getServerTranslation } from '@/helpers/getServerTranslation'

import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { isUserAuthenticated } from '@/helpers/server/model/user'
import { redirect } from 'next/navigation'

async function redirectAfterLogin() {
  'use server'
  const organisation = await getUserOrganisation()
  if (!organisation) {
    redirect('/organisations/creer')
  }
  redirect(`/organisations/${organisation.slug}`)
}

/* global PageProps */
export default async function Page({
  params,
}: PageProps<'/[locale]/organisations/connexion'>) {
  const { locale } = await params
  if (await isUserAuthenticated()) {
    await redirectAfterLogin()
  }

  const { t } = await getServerTranslation({ locale })

  return (
    <>
      <OrganisationFilAriane
        t={t}
        currentPage={{
          label: t('Connexion'),
          href: `/organisations/connexion`,
        }}
      />

      <section className="w-full bg-white">
        <div className="max-w-5xl lg:px-0">
          <h1>
            <Trans i18nKey="organisations.connexion.title" locale={locale}>
              Connectez-vous pour diffuser un lien collectif
            </Trans>
          </h1>
          <p className="max-w-full md:w-160">
            <Trans i18nKey="organisations.connexion.subtitle" locale={locale}>
              Pour diffuser un test collectif à vos élèves, vos étudiants, vos
              collègues ou encore vos clients, il vous suffit de vous connecter
              à votre espace personnel.
            </Trans>
          </p>

          <Separator />

          <div className="max-w-full md:w-160">
            <SigninSignupTabs
              className="-order-1 mb-8 lg:mb-14"
              mode={SIGNIN_MODE}
            />
            <AuthenticateUserForm
              onComplete={redirectAfterLogin}
              trackers={{
                matomo: organisationsLoginComplete,
                posthog: captureOrganisationsLoginComplete,
              }}
            />
          </div>
        </div>
      </section>
    </>
  )
}
