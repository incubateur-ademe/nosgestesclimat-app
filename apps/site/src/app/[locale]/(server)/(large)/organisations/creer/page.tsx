import OrganisationFilAriane from '@/components/layout/FilAriane'
import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getUserOrganisation } from '@/helpers/server/model/organisations'
import { isUserAuthenticated } from '@/helpers/server/model/user'
import { redirect } from 'next/navigation'
import CreationForm from './_components/CreationForm'

/* global PageProps */
export default async function CreationPage({
  params,
}: PageProps<'/[locale]/organisations/creer'>) {
  if (!(await isUserAuthenticated())) {
    redirect('/organisations/connexion')
  }
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

      <section className="w-full bg-[#fff]">
        <div className="mx-auto max-w-5xl px-0">
          <Title
            title={<Trans locale={locale}>Bienvenue sur votre espace !</Trans>}
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
