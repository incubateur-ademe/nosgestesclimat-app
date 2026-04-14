import DownArrow from '@/components/icons/DownArrow'
import {
  FIRST_OBJECTIVE,
  SECOND_OBJECTIVE,
} from '@/components/results/objective/_constants/objectives'
import Trans from '@/components/translation/trans/TransServer'
import Badge from '@/design-system/layout/Badge'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { getServerTranslation } from '@/helpers/getServerTranslation'
import type { Locale } from '@/i18nConfig'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

interface Props {
  carbonFootprint: number
  locale: Locale
  className?: string
  shouldDisplayBadge?: boolean
}

const getObjectiveData = ({
  carbonFootprint,
  locale,
  t,
}: {
  carbonFootprint: number
  locale: Locale
  t: (key: string) => string
}) => {
  const currentYear = new Date().getFullYear()
  const { formattedValue, unit } = formatFootprint(carbonFootprint, {
    t,
    locale,
  })

  const getReductionData = () => {
    const secondObjectiveNumber = SECOND_OBJECTIVE.value / 1000

    if (carbonFootprint > FIRST_OBJECTIVE.value) {
      const year = FIRST_OBJECTIVE.year
      const firstObjectiveNumber = FIRST_OBJECTIVE.value / 1000
      return {
        reductionAmount:
          (carbonFootprint - FIRST_OBJECTIVE.value) /
          Math.max(1, year - currentYear),
        titleClassName: 'text-red-900',
        bgClassName: 'bg-red-50',
        description: (
          <Trans locale={locale} i18nKey="results.objective.over7.description">
            Aujourd’hui, <strong>vous êtes au-dessus des 7 tonnes</strong>,
            l’objectif intermédiaire que nous proposons pour 2030.
          </Trans>
        ),
        reductionDescription: (
          <Trans
            locale={locale}
            i18nKey="results.objective.reduction.over7.description"
            values={{ year, firstObjectiveNumber }}>
            Votre rythme indicatif pour parvenir à{' '}
            <strong>
              {{ firstObjectiveNumber } as unknown as ReactNode}T en{' '}
              {{ year } as unknown as ReactNode}
            </strong>
          </Trans>
        ),
      }
    }

    if (carbonFootprint > SECOND_OBJECTIVE.value) {
      const year = SECOND_OBJECTIVE.year

      return {
        reductionAmount:
          (carbonFootprint - SECOND_OBJECTIVE.value) /
          Math.max(1, year - currentYear),
        titleClassName: 'text-orange-900',
        bgClassName: 'bg-orange-50',
        description: (
          <Trans
            locale={locale}
            i18nKey="results.objective.over4.description"
            values={{ year, secondObjectiveNumber }}>
            Bravo, aujourd'hui vous êtes déjà{' '}
            <strong>en transition vers l'objectif intermédiaire</strong> de{' '}
            <strong>
              {{ secondObjectiveNumber } as unknown as ReactNode}T en{' '}
              {{ year } as unknown as ReactNode}
            </strong>
          </Trans>
        ),
        reductionDescription: (
          <Trans
            locale={locale}
            i18nKey="results.objective.reduction.over4.description"
            values={{ year, secondObjectiveNumber }}>
            Votre rythme indicatif pour parvenir à{' '}
            <strong>
              {{ secondObjectiveNumber } as unknown as ReactNode}T en{' '}
              {{ year } as unknown as ReactNode}
            </strong>
          </Trans>
        ),
      }
    }

    return {
      reductionAmount: 0,
      titleClassName: 'text-green-900',
      bgClassName: 'bg-green-50',
      description: (
        <>
          <strong className="block">
            <Trans
              locale={locale}
              i18nKey="results.objective.under4.description.title"
              values={{ secondObjectiveNumber }}>
              Vous êtes déjà sous les{' '}
              {{ secondObjectiveNumber } as unknown as ReactNode} tonnes, bravo
              !
            </Trans>
          </strong>
          <span className="block w-lg max-w-full">
            <Trans
              locale={locale}
              i18nKey="results.objective.under4.description.body">
              Avec le travail de l’État et toute la société dans les années à
              venir, votre empreinte devrait naturellement diminuer pour se
              rapprocher des 2 tonnes.
            </Trans>
          </span>
        </>
      ),
      reductionDescription: null,
    }
  }

  return {
    displayValue: formattedValue,
    unit,
    ...getReductionData(),
  }
}

export default async function ObjectiveWithRhythm({
  locale,
  carbonFootprint,
  className,
  shouldDisplayBadge = true,
}: Props) {
  const { t } = await getServerTranslation({ locale })
  const {
    displayValue,
    unit,
    reductionAmount,
    titleClassName,
    bgClassName,
    description,
    reductionDescription,
  } = getObjectiveData({
    carbonFootprint,
    locale,
    t,
  })

  const { formattedValue: reductionDisplayValue, unit: reductionUnit } =
    reductionAmount
      ? formatFootprint(reductionAmount, {
          locale,
          t,
        })
      : {}

  return (
    <div
      className={twMerge('rounded-lg border border-slate-300 p-6', className)}>
      {shouldDisplayBadge && (
        <div className="mb-2">
          <Badge className="border-none text-base" color="secondary">
            <Trans locale={locale} i18nKey="common.vous">
              Vous
            </Trans>
          </Badge>
        </div>
      )}

      <div className="flex w-full flex-col gap-4 md:flex-row">
        <div className={twMerge('flex-1 rounded-lg px-6 py-4', bgClassName)}>
          <h3 className={twMerge('mb-2 text-2xl font-bold', titleClassName)}>
            {displayValue} {unit}{' '}
            <Trans locale={locale} i18nKey="common.co2eAn">
              CO₂e / an
            </Trans>
          </h3>

          <p className="mb-0">{description}</p>
        </div>

        {!!reductionAmount && (
          <>
            <DownArrow className="fill-default h-6 w-6 self-center md:-rotate-90" />

            <div className="bg-primary-100 flex-1 rounded-lg px-6 py-4">
              <p className="mb-2">{reductionDescription}</p>

              <p className="text-2xl font-bold">
                {reductionDisplayValue} {reductionUnit}{' '}
                <Trans locale={locale} i18nKey="common.parAn">
                  par an
                </Trans>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
