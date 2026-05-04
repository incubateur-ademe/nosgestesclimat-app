'use client'

import Trans from '@/components/translation/trans/TransClient'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Locale } from '@/i18nConfig'
import type { Simulation } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { useState } from 'react'
import CategorySelectorDesktop from './CategorySelectorDesktop'
import CategorySelectorMobile from './CategorySelectorMobile'
import EvolutionChart from './EvolutionChart'

type TabId = 'global' | DottedName

interface Props {
  locale: Locale
  simulations: Simulation[]
  hasSingleSimulation: boolean
}

const COLORS: Partial<Record<DottedName, string>> = {
  transport: '#1e58d7',
  logement: '#296c36',
  alimentation: '#c4430a',
  divers: '#b1500c',
}

export default function EvolutionGraph({
  locale,
  simulations,
  hasSingleSimulation,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('global')
  const { t } = useClientTranslation()

  // Get category labels
  const categoryLabels: Partial<Record<DottedName, string>> = {
    transport: t('common.category.transport', 'Transport'),
    alimentation: t('common.category.alimentation', 'Alimentation'),
    logement: t('common.category.logement', 'Logement'),
    divers: t('common.category.divers', 'Divers'),
  }

  // Generate mocked data when there's only one simulation
  const chartData = hasSingleSimulation
    ? [
        {
          date: new Date('2020-05-20'),
          dateStr: '20/05/20',
          value: 12000,
        },
        {
          date: new Date('2021-05-20'),
          dateStr: '20/05/21',
          value: 10000,
        },
        {
          date: new Date('2022-05-20'),
          dateStr: '20/05/22',
          value: 8000,
        },
        {
          date: new Date('2024-05-20'),
          dateStr: '20/05/24',
          value: 7000,
        },
        {
          date: new Date('2025-05-25'),
          dateStr: '25/05/25',
          value: 6000,
        },
      ]
    : (() => {
        // Transform data for the chart
        return simulations
          .map((simulation) => {
            const date = new Date(simulation.date)
            const value =
              activeTab === 'global'
                ? simulation.computedResults.carbone.bilan
                : simulation.computedResults.carbone.categories[activeTab] || 0

            return {
              date,
              dateStr: date.toLocaleDateString(
                locale === 'fr' ? 'fr-FR' : 'en-US',
                {
                  day: '2-digit',
                  month: '2-digit',
                  year: '2-digit',
                }
              ),
              value,
            }
          })
          .sort((a, b) => a.date.getTime() - b.date.getTime())
      })()

  // Get line color based on active tab
  const lineColor =
    activeTab === 'global' ? '#a60e66' : COLORS[activeTab] || '#a60e66'

  // Calculate Y-axis domain
  const values = chartData.map((d) => d.value)
  const maxValue = Math.max(...values, 14)
  const minValue = Math.min(0, Math.min(...values) - 1)

  return (
    <div className="relative mb-16">
      <div id="chart" className="absolute -top-24">
        {/* Compense the height of the sticky header */}
      </div>
      <h2 className="mb-6 text-2xl md:mb-8">
        <Trans i18nKey="mon-espace.evolutionGraph.title">
          Evolution de mes résultats d'empreinte
        </Trans>
      </h2>

      <CategorySelectorMobile
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        categoryLabels={categoryLabels}
        disabled={hasSingleSimulation}
      />

      <CategorySelectorDesktop
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        categoryLabels={categoryLabels}
        disabled={hasSingleSimulation}
      />

      <EvolutionChart
        locale={locale}
        chartData={chartData}
        lineColor={lineColor}
        minValue={minValue}
        maxValue={maxValue}
        disabled={hasSingleSimulation}
      />
    </div>
  )
}
