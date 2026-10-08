import Trans from '@/components/translation/trans/TransServer'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import type { EventStatusWithoutNotStarted } from '../../../../_types/event'

interface Props {
  locale: Locale
  primaryCtaHref: string
  secondaryCtaHref: string
  endedCtaHref: string
  status: EventStatusWithoutNotStarted
}

export default function EventLinks({
  locale,
  primaryCtaHref,
  secondaryCtaHref,
  endedCtaHref,
  status,
}: Props) {
  const { t } = getServerTranslation({ locale })

  if (status === 'ended') {
    return (
      <div className="btn-group mb-4">
        <ButtonLink
          className="mb-3 w-full text-base lg:text-xl"
          size="xl"
          href={endedCtaHref}
          target="_blank"
          aria-label={t(
            'event.dynamicCounter.endedCta.ariaLabel',
            'Je continue la mobilisation, ouvrir dans une nouvelle fenêtre'
          )}>
          <Trans
            i18nKey="event.dynamicCounter.endedCta.buttonLabel"
            locale={locale}>
            Je continue la mobilisation
          </Trans>
        </ButtonLink>
      </div>
    )
  }

  return (
    <div className="btn-group mb-4">
      <ButtonLink
        className="mb-3 w-full text-base lg:text-xl"
        size="xl"
        href={primaryCtaHref}
        target="_blank"
        aria-label={t(
          'event.dynamicCounter.primaryCta.ariaLabel',
          'Je mobilise mon organisation, ouvrir dans une nouvelle fenêtre'
        )}>
        <Trans i18nKey="event.dynamicCounter.primaryCta" locale={locale}>
          Je mobilise mon organisation
        </Trans>
      </ButtonLink>

      <ButtonLink
        className="w-full text-base lg:text-xl"
        href={secondaryCtaHref}
        size="xl"
        color="secondary"
        target="_blank"
        aria-label={t(
          'event.dynamicCounter.secondaryCta.ariaLabel',
          'Je participe individuellement, ouvrir dans une nouvelle fenêtre'
        )}>
        <Trans i18nKey="event.dynamicCounter.secondaryCta" locale={locale}>
          Je participe individuellement
        </Trans>
      </ButtonLink>
    </div>
  )
}
