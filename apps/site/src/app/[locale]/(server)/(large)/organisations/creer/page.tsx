import OrganisationFilAriane from '@/components/layout/FilAriane'
import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { requireAuthUser } from '@/services/auth/require-auth-user'
import { redirect } from 'next/navigation'
import CreationForm from './_components/CreationForm'

export default async function CreationPage() {
  await requireAuthUser({ redirect: '/organisations/connexion' })
  const userOrganisation = await getUserOrganisation()
  if (userOrganisation) {
    redirect(`/organisations/${userOrganisation.slug}`)
  }

  const { t } = await getServerTranslation()

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
          <Title size="lg" className="mb-2">
            <Trans>
              Créez une organisation afin de diffuser un ou plusieurs liens de
              test collectif
            </Trans>
          </Title>
          <p className="text-slate-500">
            <Trans>Plus que quelques petites questions</Trans>
          </p>

          <CreationForm />
        </div>
      </section>
    </>
  )
}
