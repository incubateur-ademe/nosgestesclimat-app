import Trans from '@/components/translation/trans/TransServer'
import GoBackLink from '@/design-system/inputs/GoBackLink'
import Title from '@/design-system/layout/Title'
import { buildAlternates } from '@/helpers/metadata/getMetadataObject'
import type { Locale } from '@/i18nConfig'
import type { Metadata } from 'next'
import { organisationAdminGuard } from '../guard'
import CloseButton from './_components/CloseButton'
import PollForm from './_components/PollForm'

/* global PageProps */
export async function generateMetadata({
  params,
}: PageProps<'/[locale]/organisations/[orgaSlug]/creer-campagne'>): Promise<Metadata> {
  const { orgaSlug, locale } = await params

  return {
    alternates: buildAlternates({
      locale: locale as Locale,
      canonical: `/organisations/${orgaSlug}/creer-campagne`,
    }),
  }
}

export default async function CreatePollPage({
  params,
}: PageProps<'/[locale]/organisations/[orgaSlug]/creer-campagne'>) {
  const { orgaSlug } = await params
  const { organisation } = await organisationAdminGuard(orgaSlug)
  return (
    <div className="mt-4 mb-16 md:mt-8">
      <div className="mb-4 flex flex-row justify-between">
        <GoBackLink href={`/organisations/${orgaSlug}`} />

        <CloseButton organisationSlug={orgaSlug} />
      </div>

      <div className="mb-4 flex flex-col justify-between md:flex-nowrap">
        <Title size="lg">
          <Trans i18nKey="collectiveTest.title">
            Choisissez un nom pour votre test collectif
          </Trans>
        </Title>

        <p className="mb-2">
          <Trans i18nKey="collectiveTest.text1">
            Créez un lien personnalisé{' '}
            <strong>à partager dans votre organisation</strong>.
          </Trans>
        </p>

        <p className="mb-8">
          <Trans i18nKey="collectiveTest.text2">
            Les participants passent le test <strong>anonymement</strong> et
            vous accédez à une <strong>synthèse des résultats</strong>.
          </Trans>
        </p>

        <PollForm organisation={organisation} />
      </div>
    </div>
  )
}
