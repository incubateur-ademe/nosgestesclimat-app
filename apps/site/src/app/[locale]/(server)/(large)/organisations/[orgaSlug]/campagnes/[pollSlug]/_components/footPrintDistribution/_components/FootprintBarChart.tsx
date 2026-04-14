'use client'

import { formatFootprint } from '@/helpers/formatters/formatFootprint'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import isMobile from 'is-mobile'
import {
  Bar,
  BarChart,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { twMerge } from 'tailwind-merge'

interface Props {
  groupFootprint: number
  userFootprint?: number
  targetValue?: number
  className?: string
}

export default function FootprintBarChart({
  groupFootprint,
  userFootprint,
  targetValue = 2,
  className,
}: Props) {
  const { t } = useClientTranslation()

  const groupFormatted = formatFootprint(groupFootprint, {
    maximumFractionDigits: 1,
    t,
  })

  // Convert to tonnes for consistent display
  const groupFootprintInTonnes =
    groupFootprint >= 1000 ? groupFootprint / 1000 : groupFootprint
  const userFootprintInTonnes =
    userFootprint && userFootprint >= 1000
      ? userFootprint / 1000
      : userFootprint
  const targetValueInTonnes =
    targetValue >= 1000 ? targetValue / 1000 : targetValue

  const maxValue =
    Math.ceil(
      Math.max(
        groupFootprintInTonnes,
        userFootprintInTonnes || 0,
        targetValueInTonnes
      ) / 5
    ) * 5

  const userFormatted = userFootprint
    ? formatFootprint(userFootprint, {
        maximumFractionDigits: 1,
        t,
      })
    : null

  const data = [
    {
      name: t(
        'pollResults.footprintBarChart.groupFootprint',
        'Empreinte moyenne du groupe'
      ),
      value: groupFootprintInTonnes,
      formattedValue: `${groupFormatted.formattedValue} ${groupFormatted.unit}`,
    },
    ...(userFootprint
      ? [
          {
            name: t(
              'pollResults.footprintBarChart.userFootprint',
              'Votre empreinte'
            ),
            value: userFootprintInTonnes,
            formattedValue: `${userFormatted?.formattedValue} ${userFormatted?.unit}`,
          },
        ]
      : []),
  ]

  const getAccessibleDescription = () => {
    let description = t(
      'pollResults.footprintBarChart.accessibleDescription.chart',
      'Graphique en barres montrant la comparaison des empreintes carbone. '
    )
    description +=
      t(
        'pollResults.footprintBarChart.accessibleDescription.groupFootprint',
        "L'empreinte moyenne du groupe est de {{value}} {{unit}}.",
        {
          value: groupFormatted.formattedValue,
          unit: groupFormatted.unit,
        }
      ) + ' '

    if (userFootprint) {
      description +=
        t(
          'pollResults.footprintBarChart.accessibleDescription.userFootprint',
          'Votre empreinte personnelle est de {{value}} {{unit}}.',
          {
            value: userFormatted?.formattedValue,
            unit: userFormatted?.unit,
          }
        ) + ' '
    }

    description +=
      t(
        'pollResults.footprintBarChart.accessibleDescription.target',
        "L'objectif à atteindre d'ici {{year}} est de {{value}} {{unit}}.",
        {
          year: '2050',
          value: '2',
          unit: 'tonnes',
        }
      ) + ' '

    if (userFootprint) {
      const comparison =
        userFootprint > groupFootprint
          ? t(
              'pollResults.footprintBarChart.accessibleDescription.higher',
              'supérieure'
            )
          : t(
              'pollResults.footprintBarChart.accessibleDescription.lower',
              'inférieure'
            )
      description +=
        t(
          'pollResults.footprintBarChart.accessibleDescription.userComparison',
          'Votre empreinte est {{comparison}} à celle du groupe.',
          {
            comparison,
          }
        ) + ' '
    }

    const groupVsTarget =
      groupFootprint > targetValue
        ? t(
            'pollResults.footprintBarChart.accessibleDescription.higher',
            'supérieure'
          )
        : t(
            'pollResults.footprintBarChart.accessibleDescription.lower',
            'inférieure'
          )
    description += t(
      'pollResults.footprintBarChart.accessibleDescription.groupComparison',
      "L'empreinte du groupe est {{comparison}} à l'objectif.",
      {
        comparison: groupVsTarget,
      }
    )

    return description
  }

  const CustomBar = (props: {
    payload?: { formattedValue?: string; name?: string }
    fill?: string
    x?: number
    y?: number
    width?: number
    height?: number
  }) => {
    const { payload, fill, x = 0, y = 0, width = 0, height = 0 } = props
    const formattedValue = payload?.formattedValue || ''
    const name = payload?.name || ''

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          rx={4}
          ry={4}
          role="img"
          aria-label={`${name}: ${formattedValue}`}
        />
        <text
          x={x + width + 8}
          y={y + height / 2}
          textAnchor="start"
          dominantBaseline="middle"
          fill="black"
          fontSize={isMobile() ? 12 : 16}
          fontWeight="600">
          {formattedValue}
        </text>
      </g>
    )
  }

  return (
    <div
      className={twMerge(
        'flex h-full w-full flex-col items-center justify-center',
        className
      )}>
      <div className="sr-only" aria-live="polite">
        {getAccessibleDescription()}
      </div>
      <div className="w-full">
        <ResponsiveContainer width="100%" height={isMobile() ? 240 : 300}>
          <BarChart
            data={data}
            margin={{
              top: 40,
              right: maxValue > 100 ? 100 : maxValue > 15 ? 60 : 10,
              left: 0,
              bottom: 0,
            }}
            accessibilityLayer
            layout="vertical"
            barGap={0}
            barCategoryGap={0}>
            <XAxis
              type="number"
              domain={[0, maxValue + 5]}
              axisLine
              tickLine
              tick={{ fontSize: isMobile() ? 12 : 16, fill: '#444' }}
              tickFormatter={(value) => {
                return `${value} ${value > 1 ? groupFormatted.unit : `${groupFormatted.unit?.replace('s', '')}`}`
              }}
              width={0}
              ticks={Array.from(
                { length: Math.floor(maxValue / 5) + 1 },
                (_, i) => i * 5
              )}
            />

            <YAxis
              type="category"
              dataKey="name"
              axisLine
              tickLine={false}
              tick={false}
              interval={-10}
              width={5}
            />

            <Bar dataKey="value" barSize={50} shape={<CustomBar />}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? '#8e9eeb' : '#585ad3'}
                />
              ))}
            </Bar>

            <ReferenceLine
              x={targetValueInTonnes}
              stroke="#a60e66"
              strokeDasharray="5 5"
              strokeWidth={2}
            />

            <ReferenceLine
              x={targetValueInTonnes}
              stroke="transparent"
              label={({ viewBox }) => {
                const { x, y } = viewBox
                return (
                  <g>
                    <text
                      x={x}
                      y={y - 10}
                      fill="#a60e66"
                      fontSize="14px"
                      fontWeight="bold"
                      textAnchor="start">
                      {t(
                        'pollResults.footprintBarChart.targetLabelMobile',
                        'Objectif 2050 :'
                      )}{' '}
                      {targetValueInTonnes}{' '}
                      {t(
                        'pollResults.footprintBarChart.targetLabelUnit',
                        'tonnes'
                      )}
                    </text>
                  </g>
                )
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {userFootprint && (
        <div className="mt-2 flex justify-center gap-3 md:gap-8">
          <div className="flex items-center gap-2">
            <div className="bg-primary-400 h-4 w-4 rounded"></div>
            <span className="text-xs text-gray-900 md:text-sm">
              {t(
                'pollResults.footprintBarChart.legend.groupFootprint',
                'Empreinte moyenne du groupe'
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-primary-700 h-4 w-4 rounded"></div>
            <span className="text-xs text-gray-900 md:text-sm">
              {t(
                'pollResults.footprintBarChart.legend.userFootprint',
                'Votre empreinte'
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
