import AuthenticateUserForm from '@/components/authentication/AuthenticateUserForm'
import OrganisationFilAriane from '@/components/layout/FilAriane'
import SigninSignupTabs from '@/components/signIn/SignInSignUpTabs'
import Trans from '@/components/translation/trans/TransServer'
import { SIGNUP_MODE } from '@/constants/authentication/modes'
import { captureOrganisationsLoginComplete } from '@/constants/tracking/pages/organisationsConnexion'
import Separator from '@/design-system/layout/Separator'
import { getServerTranslation } from '@/helpers/getServerTranslation'

import { buildAlternates } from '@/helpers/metadata/getMetadataObject'
import { getUserOrganisation } from '@/helpers/server/model/organisations'
import type { Locale } from '@/i18nConfig'
import { getUserSession } from '@/services/auth/get-user-session'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/organisations/inscription'>): Promise<Metadata> {
  const { locale } = await params

  return {
    alternates: buildAlternates({
      locale: locale as Locale,
      canonical: '/organisations/inscription',
    }),
  }
}

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
              Créez votre compte pour diffuser un lien collectif
            </Trans>
          </h1>
          <p className="max-w-full md:w-160">
            <Trans i18nKey="organisations.inscription.subtitle" locale={locale}>
              Pour diffuser un test collectif à vos élèves, vos étudiants, vos
              collègues ou encore vos clients, il vous suffit de créer votre
              espace personnel.
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
              tracker={captureOrganisationsLoginComplete}
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
