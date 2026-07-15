import AuthenticateUserForm from '@/components/AuthenticateUserForm'
import OrganisationFilAriane from '@/components/layout/FilAriane'
import SigninSignupTabs from '@/components/signIn/SignInSignUpTabs'
import Trans from '@/components/translation/trans/TransServer'
import { SIGNUP_MODE } from '@/constants/authentication/modes'
import {
  captureOrganisationsLoginComplete,
  organisationsLoginComplete,
} from '@/constants/tracking/pages/organisationsConnexion'
import Separator from '@/design-system/layout/Separator'
import { getServerTranslation } from '@/helpers/getServerTranslation'

import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { getUserSession } from '@/services/auth/get-user-session'
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
  if ((await getUserSession())?.isAuth) {
    await redirectAfterLogin()
  }

  const { t } = await getServerTranslation({ locale })

  return (
    <>
      <OrganisationFilAriane
        t={t}
        currentPage={{
          label: t('organisations.inscription.breadcrumb', 'Inscription'),
          href: `/organisations/inscription`,
        }}
      />

      <section className="w-full bg-white">
        <div className="max-w-5xl lg:px-0">
          <h1>
            <Trans i18nKey="organisations.inscription.title" locale={locale}>
              Connectez-vous pour diffuser votre lien de test collectif
            </Trans>
          </h1>
          <p className="max-w-full md:w-160">
            <Trans i18nKey="organisations.inscription.subtitle" locale={locale}>
              Pour diffuser votre test collectif à vos élèves, vos étudiants, vos
              collègues ou vos clients, il vous suffit de créer votre espace
              personnel sécurisé. Accédez ensuite aux résultats des participants
              sous forme de graphiques comparatifs.
            </Trans>
          </p>

          <Separator />

          <div className="max-w-full md:w-160">
            <SigninSignupTabs
              className="-order-1 mb-8 lg:mb-14"
              mode={SIGNUP_MODE}
            />
            <AuthenticateUserForm
              onComplete={redirectAfterLogin}
              trackers={{
                matomo: organisationsLoginComplete,
                posthog: captureOrganisationsLoginComplete,
              }}
              buttonLabel={t(
                'organisations.inscription.cta',
                'Créer mon compte'
              )}
            />
          </div>
        </div>
      </section>
    </>
  )
}
