'use client'

import Trans from '@/components/translation/trans/TransClient'
import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Categories } from '@incubateur-ademe/nosgestesclimat'
import isMobile from 'is-mobile'
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { twMerge } from 'tailwind-merge'

interface Props {
  userValues: Record<Categories, number>
  averageValues: Record<Categories, number>
  className?: string
}

export default function CategoryRadarChart({
  userValues,
  averageValues,
  className,
}: Props) {
  const { t } = useClientTranslation()

  const categoryLabels = {
    transport: t('common.category.transport', 'Transport'),
    alimentation: isMobile()
      ? t('common.category.alimentationShort', 'Alim.')
      : t('common.category.alimentation', 'Alimentation'),
    logement: t('common.category.logement', 'Logement'),
    divers: t('common.category.divers', 'Divers'),
    'services sociétaux': t('common.category.services', 'Services'),
  }

  const categoryLabelsFull = {
    transport: t('common.category.transport', 'Transport'),
    alimentation: t('common.category.alimentation', 'Alimentation'),
    logement: t('common.category.logement', 'Logement'),
    divers: t('common.category.divers', 'Divers'),
    'services sociétaux': t('common.category.services', 'Services'),
  }

  const maxValue =
    Math.ceil(
      Math.max(...Object.values(userValues), ...Object.values(averageValues)) /
        5
    ) + 5

  const data = Object.keys(userValues).map((key) => {
    const category = key as Categories
    const userValue = userValues[category]
    const averageValue = averageValues[category]

    return {
      category,
      name: categoryLabels[category],
      nameFull: categoryLabelsFull[category],
      user: userValue,
      average: averageValue,
      userFormatted: formatFootprint(userValue, {
        maximumFractionDigits: 1,
        t,
      }),
      averageFormatted: formatFootprint(averageValue, {
        maximumFractionDigits: 1,
        t,
      }),
    }
  })

  const getAccessibleDescription = () => {
    let description = t(
      'pollResults.radarChart.accessibleDescription.chart',
      'Graphique radar comparant vos résultats aux moyennes par catégorie. '
    )

    data.forEach((item) => {
      const userHigher = item.user > item.average
      const comparison = userHigher
        ? t('pollResults.radarChart.accessibleDescription.higher', 'supérieur')
        : t('pollResults.radarChart.accessibleDescription.lower', 'inférieur')

      description += `${t(
        'pollResults.radarChart.accessibleDescription.category',
        '{{category}}: vos résultats {{user}} {{comparison}} à la moyenne {{average}}.',
        {
          category: item.nameFull,
          user: `${item.userFormatted.formattedValue} ${item.userFormatted.unit ?? ''}`,
          average: `${item.averageFormatted.formattedValue} ${item.averageFormatted.unit ?? ''}`,
          comparison,
        }
      )} `
    })

    return description
  }

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean
    payload?: { dataKey: string; value: number }[]
    label?: string
  }) => {
    if (active && payload?.length) {
      const userValue = payload.find((p) => p.dataKey === 'user')?.value || 0
      const averageValue =
        payload.find((p) => p.dataKey === 'average')?.value || 0

      const userFormatted = formatFootprint(userValue, {
        maximumFractionDigits: 1,
        t,
      })
      const averageFormatted = formatFootprint(averageValue, {
        maximumFractionDigits: 1,
        t,
      })

      return (
        <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="mb-2 font-semibold text-gray-900">
            {data.find((item) => item.name === label)?.nameFull || label}
          </p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="bg-primary-800 h-3 w-3 rounded"></div>
              <span className="text-sm text-gray-700">
                {t(
                  'pollResults.radarChart.legend.userResults',
                  'Mes résultats'
                )}{' '}
                : {userFormatted.formattedValue} {userFormatted.unit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-pink-800"></div>
              <span className="text-sm text-gray-700">
                {t('pollResults.radarChart.legend.average', 'Moyenne')} :{' '}
                {averageFormatted.formattedValue} {averageFormatted.unit}
              </span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className={twMerge('w-full', className)}>
      <h3 className="mb-6">
        <strong>
          <Trans i18nKey="pollResults.radarChart.title">
            Votre empreinte par rapport aux autres participants
          </Trans>
        </strong>
      </h3>

      <div className="sr-only" aria-live="polite">
        {getAccessibleDescription()}
      </div>

      <div className="relative rounded-xl bg-white">
        <ResponsiveContainer width="100%" height={isMobile() ? 240 : 330}>
          <RadarChart
            accessibilityLayer
            data={data}
            height={300}
            margin={{ top: 20, right: 20, bottom: 0, left: 20 }}>
            <PolarGrid stroke="#444" strokeDasharray="5 5" strokeWidth={1} />

            <PolarAngleAxis
              dataKey="name"
              tick={{
                fontSize: isMobile() ? 12 : 16,
                fill: '#444',
                transform: 'rotate(0)',
              }}
              radius={12}
            />

            <PolarRadiusAxis
              domain={[0, maxValue]}
              tick={{
                fontSize: 10,
                fill: 'black',
                textAnchor: 'middle',
                dominantBaseline: 'middle',
              }}
              tickFormatter={(value) => {
                const formatted = formatFootprint(value, {
                  maximumFractionDigits: 1,
                  t,
                })
                if (!formatted.formattedValue || value === maxValue) return ''
                return `${formatted.formattedValue} ${formatted.unit ?? ''}`
              }}
              angle={90}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip accessibilityLayer content={<CustomTooltip />} />

            <Radar
              name={t(
                'pollResults.radarChart.legend.userResults',
                'Mes résultats'
              )}
              dataKey="user"
              stroke="#3d3f96"
              fill="#3d3f96"
              fillOpacity={0.3}
              strokeWidth={2}
            />

            <Radar
              name={t('pollResults.radarChart.legend.average', 'Moyenne')}
              dataKey="average"
              stroke="#a60e66"
              fill="#a60e66"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>

        <div className="flex justify-center gap-3 md:gap-8">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-pink-800"></div>
            <span className="text-xs text-gray-900 md:text-sm">
              {t(
                'pollResults.footprintBarChart.legend.groupFootprint',
                'Empreinte moyenne du groupe'
              )}{' '}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-primary-800 h-4 w-4 rounded"></div>
            <span className="text-xs text-gray-900 md:text-sm">
              {t(
                'pollResults.footprintBarChart.legend.userFootprint',
                'Votre empreinte'
              )}{' '}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
