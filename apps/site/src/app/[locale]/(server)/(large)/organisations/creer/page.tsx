import OrganisationFilAriane from '@/components/layout/FilAriane'
import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { requireAuthUser } from '@/services/auth/require-auth-user'
import { redirect } from 'next/navigation'
import CreationForm from './_components/CreationForm'

/* global PageProps */
export default async function CreationPage({
  params,
}: PageProps<'/[locale]/organisations/creer'>) {
  await requireAuthUser({ redirect: '/organisations/connexion' })
  const userOrganisation = await getUserOrganisation()
  if (userOrganisation) {
    redirect(`/organisations/${userOrganisation.slug}`)
  }

  const { locale } = await params
  const { t } = await getServerTranslation({ locale })

  return (
    <>
      <OrganisationFilAriane
        t={t}
        currentPage={{
          label: t('Créer'),
          href: `/organisations/creer`,
        }}
      />

      <section className="w-full bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-0">
          <Title
            size="lg"
            title={
              <Trans locale={locale}>
                Créez une organisation afin de diffuser un ou plusieurs liens de
                test collectif
              </Trans>
            }
            subtitle={
              <Trans locale={locale}>Plus que quelques petites questions</Trans>
            }
            hasSeparator={false}
          />

          <CreationForm />
        </div>
      </section>
    </>
  )
}
