import { END_PAGE_ACTIONS_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { titleSizesClassNames } from '@/design-system/layout/Title'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Tendency } from '@/helpers/server/model/utils/getTendency'
import type { Locale } from '@/i18nConfig'
import type { Metric } from '@/publicodes-state/types'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import Trans from '../translation/trans/TransServer'
import TendencyIndicator from './TendencyIndicator'

interface Props {
  className?: string
  locale: Locale
  value: number
  title: ReactNode
  metric: Metric
  tendency?: Tendency
  unitSuffix: ReactNode
}
export default async function FootprintBlock({
  className,
  tendency,
  value,
  title,
  metric,
  locale,
  unitSuffix,
}: Props) {
  const { t } = await getServerTranslation({ locale })
  const { formattedValue, unit } = formatFootprint(value, {
    locale,
    t,
    metric,
  })
  return (
    <div
      className={twMerge(
        'flex flex-col items-stretch gap-4 md:flex-row md:gap-8',
        className
      )}>
      <div className="bg-primary-100 animate-fade-in-slide-from-top md:no-wrap flex w-full flex-wrap items-center justify-between gap-4 rounded-2xl p-5 [animation-delay:200ms] [animation-fill-mode:both] motion-reduce:translate-y-0 motion-reduce:animate-none motion-reduce:opacity-100 md:w-[65%] md:p-8">
        <h1 className="mb-0 flex-1">
          <span className="mb-1 block text-lg font-normal">{title}</span>

          <span
            className={twMerge(
              titleSizesClassNames.lg,
              'text-primary-600 font-bold!'
            )}>
            {formattedValue}&nbsp;{unit}&nbsp;
            {unitSuffix}
          </span>
        </h1>
        {tendency && <TendencyIndicator locale={locale} tendency={tendency} />}
      </div>

      <div className="bg-secondary-100 animate-fade-in-slide-from-top flex w-full flex-col rounded-2xl p-5 [animation-delay:500ms] [animation-fill-mode:both] motion-reduce:translate-y-0 motion-reduce:animate-none motion-reduce:opacity-100 md:w-[35%] md:p-8">
        <p className="font-bold">
          <Trans
            locale={locale}
            i18nKey="results.footprintBlock.actionsBlock.title">
            Comment réduire votre empreinte :
          </Trans>
        </p>

        <ButtonLink href={END_PAGE_ACTIONS_PATH}>
          <Trans
            locale={locale}
            i18nKey="results.footprintBlock.actionsBlock.link">
            Découvrir mes actions
          </Trans>

          <span aria-hidden="true" className="ml-1">
            →
          </span>
        </ButtonLink>
      </div>
    </div>
  )
}
