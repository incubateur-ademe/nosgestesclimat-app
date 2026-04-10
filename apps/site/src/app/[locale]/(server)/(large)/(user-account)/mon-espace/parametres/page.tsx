import QueryClientProviderWrapper from '@/app/[locale]/_components/mainLayoutProviders/QueryClientProviderWrapper'
import Trans from '@/components/translation/trans/TransServer'
import { MON_ESPACE_SETTINGS_PATH } from '@/constants/urls/paths'
import Title from '@/design-system/layout/Title'
import { throwNextError } from '@/helpers/server/error'
import {
  getNewsletters,
  getNewsletterSubscriptions,
} from '@/helpers/server/model/newsletter'
import { getAuthUser } from '@/helpers/server/model/user'
import { UserProvider } from '@/publicodes-state'
import type { DefaultPageProps } from '@/types'
import ProfileTab from '../_components/ProfileTabs'
import Localisation from './_components/Localisation'
import NewsletterSettings from './_components/NewsletterSettings'
import UserEmail from './_components/UserEmail'

export default async function SettingsPage({ params }: DefaultPageProps) {
  const { locale } = await params
  const [subscriptions, newsletters, user] = await throwNextError(() =>
    Promise.all([
      getNewsletterSubscriptions(),
      getNewsletters({ locale }),
      getAuthUser(),
    ])
  )

  return (
    <div className="flex flex-col">
      <ProfileTab activePath={MON_ESPACE_SETTINGS_PATH} locale={locale} />

      <div className="mb-6 flex w-full items-start justify-between">
        <Title
          title={
            <span>
              <Trans locale={locale} i18nKey="mon-espace.settings.title">
                Paramètres
              </Trans>
            </span>
          }
          className="mb-0"
        />
      </div>

      <section aria-labelledby="user-info-title" className="mb-10">
        <h2 id="user-info-title" className="mb-4">
          <Trans i18nKey="mon-espace.settings.userInfos.title" locale={locale}>
            Mes informations
          </Trans>
        </h2>

        <div className="flex max-w-[720px] flex-col gap-8">
          <QueryClientProviderWrapper>
            <UserProvider serverUserId={user.id}>
              <UserEmail />
            </UserProvider>
          </QueryClientProviderWrapper>

          <h2 className="mt-8">
            <Trans i18nKey="settings.newsletters.title" locale={locale}>
              Inscription à nos contenus
            </Trans>
          </h2>
          <NewsletterSettings {...{ newsletters, subscriptions }} />
        </div>
      </section>
      <section className="mt-2">
        <QueryClientProviderWrapper>
          <UserProvider serverUserId={user.id}>
            <Localisation />
          </UserProvider>
        </QueryClientProviderWrapper>
      </section>
    </div>
  )
}
