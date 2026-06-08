import Trans from '@/components/translation/trans/TransServer'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import type { Locale } from '@/i18nConfig'
import CircularProgressbar from './CircularProgressbar'

interface Props {
  locale: Locale
}

const currentValue = 18501
const targetValue = 50000

export default function EventDynamicCounter({ locale }: Props) {
  const numberFormatter = new Intl.NumberFormat(locale)
  const formattedCurrent = numberFormatter.format(currentValue)
  const formattedTarget = numberFormatter.format(targetValue)

  return (
    <div className="flex-1 rounded-t-3xl rounded-b-lg border border-slate-200 p-6 shadow-sm md:rounded-3xl md:p-8">
      <span className="mb-4 flex items-center text-green-700">
        <span
          aria-hidden
          className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-green-700 align-baseline motion-reduce:animate-none"
        />

        <span className="text-xs font-bold uppercase">
          <Trans i18nKey="event.dynamicCounter.text" locale={locale}>
            EN DIRECT
          </Trans>
        </span>
      </span>

      <div className="mb-6 flex gap-4 md:gap-6">
        <div className="max-w-full min-w-16 md:min-w-36">
          <CircularProgressbar value={46} text="46%" />
        </div>

        <div>
          <p className="mb-1! text-slate-600">
            <Trans i18nKey="event.dynamicCounter.target.title" locale={locale}>
              Objectif
            </Trans>
          </p>
          <p>
            <span className="mb-1 flex flex-wrap items-baseline gap-1 leading-none! md:flex-nowrap">
              <span className="text-5xl leading-14! font-bold tracking-tight md:text-6xl md:leading-12!">
                {formattedCurrent}
              </span>
              <span className="text-2xl leading-none! font-medium tracking-tight text-slate-600 md:text-3xl">
                /{formattedTarget}
              </span>
            </span>

            <span className="inline-block text-sm">
              <Trans i18nKey="event.dynamicCounter.target.text" locale={locale}>
                calculs d'empreinte carbone
              </Trans>
            </span>
          </p>
        </div>
      </div>

      <div className="mb-4">
        <ButtonLink className="mb-3 w-full" size="lg" href="/">
          <Trans i18nKey="event.dynamicCounter.primaryCta" locale={locale}>
            J'engage mon organisation
          </Trans>
        </ButtonLink>

        <ButtonLink className="w-full" href="/" size="lg" color="secondary">
          <Trans i18nKey="event.dynamicCounter.secondaryCta" locale={locale}>
            Je participe individuellement
          </Trans>
        </ButtonLink>
      </div>

      <p className="text-center text-sm text-slate-600">
        <Trans i18nKey="event.dynamicCounter.promise" locale={locale}>
          Résultats en 10 minutes — 100% gratuit
        </Trans>
      </p>
    </div>
  )
}
