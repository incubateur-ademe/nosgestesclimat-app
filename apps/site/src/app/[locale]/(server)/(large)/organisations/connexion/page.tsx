import AuthenticateUserForm from '@/components/AuthenticateUserForm'
import OrganisationFilAriane from '@/components/layout/FilAriane'
import Trans from '@/components/translation/trans/TransServer'
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

      <section className="w-full bg-[#fff]">
        <div className="max-w-5xl lg:px-0">
          <h1>
            <Trans locale={locale}>
              Accédez à votre espace organisation pour diffuser facilement Nos
              Gestes Climat
            </Trans>
          </h1>
          <p>
            <Trans locale={locale}>
              Diffusez un lien collectif depuis votre espace personnel et
              accédez à des bilans visuels chiffrés de votre impact.
            </Trans>
          </p>
          <Separator />
          <div className="max-w-full md:w-[40rem]">
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
