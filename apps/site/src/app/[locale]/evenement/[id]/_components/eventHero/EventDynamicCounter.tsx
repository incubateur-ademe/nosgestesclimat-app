import Trans from '@/components/translation/trans/TransServer'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import type { Locale } from '@/i18nConfig'

interface Props {
  locale: Locale
}

export default function EventDynamicCounter({ locale }: Props) {
  return (
    <div>
      <div>
        <span aria-hidden className="text-2xl text-green-700">
          •
        </span>

        <span>
          <Trans i18nKey="event.dynamicCounter.text" locale={locale}>
            EN DIRECT
          </Trans>
        </span>
      </div>

      <div>
        <ButtonLink href="/">
          <Trans i18nKey="event.dynamicCounter.primaryCta" locale={locale}>
            J'engage mon organisation
          </Trans>
        </ButtonLink>

        <ButtonLink href="/" color="secondary">
          <Trans i18nKey="event.dynamicCounter.secondaryCta" locale={locale}>
            Je participe individuellement
          </Trans>
        </ButtonLink>
      </div>
    </div>
  )
}
