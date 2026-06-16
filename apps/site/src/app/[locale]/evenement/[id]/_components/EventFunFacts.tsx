import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
interface Props {
  locale: Locale
}
export function EventFunFacts({ locale }: Props) {
  return (
    <p className="text-center text-5xl leading-16 font-bold">
      <Trans locale={locale} i18nKey="event.funFacts.title">
        Vous êtes déjà <span className="text-primary-600">0</span>
        <br />à avoir participé.
      </Trans>
    </p>
  )
}
