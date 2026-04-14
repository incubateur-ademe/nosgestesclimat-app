import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import Link from '@/components/Link'
import PasserTestBanner from '@/components/layout/PasserTestBanner'
import Trans from '@/components/translation/trans/TransServer'
import Markdown from '@/design-system/utils/Markdown'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import { getPost } from '@/helpers/markdown/getPost'
import { getMetadataObject } from '@/helpers/metadata/getMetadataObject'
import { getUser } from '@/helpers/server/dal/user'
import { UserProvider } from '@/publicodes-state'
import type { DefaultPageProps } from '@/types'
import { capitalizeString } from '@/utils/capitalizeString'

export async function generateMetadata({
  params,
}: DefaultPageProps<{ params: { slug: string } }>) {
  const { slug, locale } = await params
  const { t } = await getServerTranslation({ locale })

  return getMetadataObject({
    locale,
    title: `${capitalizeString(decodeURI(slug))?.replaceAll(
      '-',
      ' '
    )}, ${t('nouveautés - Nos Gestes Climat')}`,
    description: t('Découvrez les nouveautés du site Nos Gestes Climat.'),
    params: { slug },
  })
}

export default async function Release({
  params,
}: DefaultPageProps<{ params: { slug: string } }>) {
  const { slug, locale } = await params
  const nouveaute = getPost(`src/locales/nouveautes/${locale}/`, slug)
  const { id: initialUserId } = await getUser()

  return (
    <div>
      <Link href="/nouveautes" className="mb-8 block text-sm">
        ← <Trans locale={locale}>Retour à la liste des nouveautes</Trans>
      </Link>

      <QueryClientProviderWrapper>
        <UserProvider serverUserId={initialUserId}>
          <PasserTestBanner />
        </UserProvider>
      </QueryClientProviderWrapper>

      {nouveaute ? (
        <Markdown>{nouveaute?.content}</Markdown>
      ) : (
        <Trans locale={locale}>
          Oups, nous n'avons pas d'article correspondant
        </Trans>
      )}
    </div>
  )
}
