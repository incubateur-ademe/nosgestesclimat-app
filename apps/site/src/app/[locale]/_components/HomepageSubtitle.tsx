import ShieldIcon from '@/components/icons/ShieldIcon'
import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'

export default function HomepageSubtitle({ locale }: { locale: Locale }) {
  return (
    <p className="mb-0 inline-block items-center">
      <ShieldIcon className="mr-2 inline" />
      <strong className="text-primary-700 inline">
        <Trans locale={locale}>
          Résultats immédiats, confidentiel et gratuit.
        </Trans>
      </strong>
    </p>
  )
}
