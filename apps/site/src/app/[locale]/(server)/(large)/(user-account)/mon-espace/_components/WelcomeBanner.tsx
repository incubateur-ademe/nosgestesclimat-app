import PlusIcon from '@/components/icons/PlusIcon'
import Link from '@/components/Link'
import Trans from '@/components/translation/trans/TransServer'
import { MON_ESPACE_PATH } from '@/constants/urls/paths'
import Separator from '@/design-system/layout/Separator'
import Emoji from '@/design-system/utils/Emoji'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'

export default async function WelcomeBanner({ locale }: { locale: Locale }) {
  const { t } = await getServerTranslation({ locale })

  return (
    <div className="relative mb-10 rounded-lg bg-blue-50 p-4 md:p-6">
      <article className="relative flex flex-col">
        <div>
          <div>
            <h1 className="mb-4">
              {' '}
              <span className="inline-block text-xl md:text-2xl">
                <Trans i18nKey="mon-espace.welcome.title" locale={locale}>
                  Bienvenue dans votre espace Nos Gestes climat !
                </Trans>
                <Emoji>👋</Emoji>
              </span>
            </h1>
            <Separator className="mt-0 mb-6" />
          </div>

          <Link
            href={MON_ESPACE_PATH}
            title={t(
              'mon-espace.welcome.close-banner',
              'Fermer la bannière de bienvenue'
            )}
            className="absolute top-0 right-0">
            <PlusIcon className="h-5 w-5 min-w-5 origin-center rotate-45" />
          </Link>
        </div>

        <p>
          <Trans locale={locale} i18nKey="mon-espace.welcome.description.part1">
            Ici, vous pourrez <strong>suivre vos résultats</strong>, passer à{' '}
            <strong>l’action</strong>, et{' '}
            <strong>embarquer d’autres personnes</strong> avec vous.
          </Trans>
        </p>
      </article>
    </div>
  )
}
