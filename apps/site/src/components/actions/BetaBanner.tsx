import { BannerContent } from '@/design-system/cms/BannerContent'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import Trans from '../translation/trans/TransServer'

export default async function BetaBanner({ locale }: { locale: string }) {
  const { t } = await getServerTranslation({ locale })

  return (
    <div className="-mt-12 mb-8">
      <BannerContent
        color="secondary"
        banner={{
          text: (
            <Trans i18nKey={'actions.beta-banner.content'} locale={locale}>
              Cette <strong>version bêta</strong> est en cours d'amélioration.
              Aidez-nous à l’améliorer en{' '}
              <a
                href="https://tally.so/r/rjvbvR"
                target="_blank"
                className="font-bold underline"
                aria-label={t(
                  'actions.beta-banner.link.aria-label',
                  'Laisser votre avis, nouvelle fenêtre'
                )}>
                laissant votre avis.
              </a>
            </Trans>
          ),
        }}
      />
    </div>
  )
}
