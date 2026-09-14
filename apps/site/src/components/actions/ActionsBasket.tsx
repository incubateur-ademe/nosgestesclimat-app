import type { Locale } from '@/i18nConfig'
import Trans from '../translation/trans/TransServer'

interface Props {
  locale: Locale
}

export default function ActionsBasket({ locale }: Props) {
  return (
    <aside>
      <h2>
        <Trans locale={locale} i18nKey="actions.basket.title">
          Ma sélection d'actions
        </Trans>
      </h2>

      <p>
        <Trans locale={locale} i18nKey="actions.basket.subtitle"></Trans>
      </p>
    </aside>
  )
}
