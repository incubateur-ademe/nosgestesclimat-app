import Trans from '@/components/translation/trans/TransServer'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import type { Locale } from '@/i18nConfig'
import type { ReactElement } from 'react'

interface Props {
  locale: Locale
  group: { name: string; href: string }
}

export default function GroupThankYouBlock({ locale, group }: Props) {
  const groupName = group.name
  return (
    <section
      className="mb-12 rounded-2xl bg-pink-100 px-8 py-10 text-center"
      data-testid="poll-confirmation-block">
      <p className="mb-1 text-lg font-bold">
        <Trans locale={locale} i18nKey="results.groupThankYou.title">
          Merci d'avoir complété le test !
        </Trans>
      </p>

      <p className="mb-6 text-gray-700">
        <Trans locale={locale} i18nKey="results.groupThankYou.description">
          Découvrez les résultats du test collectif{' '}
          <strong>"{{ groupName } as unknown as ReactElement}"</strong>
        </Trans>
      </p>

      <ButtonLink
        href={group.href}
        color="primary"
        size="md"
        data-testid="see-group-result-button">
        <Trans locale={locale} i18nKey="results.groupThankYou.cta">
          Voir les résultats
        </Trans>
      </ButtonLink>
    </section>
  )
}
