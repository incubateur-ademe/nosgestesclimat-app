'use client'

import Link from '@/components/Link'
import BilanChart from '@/components/charts/BilanChart'
import ServicesChart from '@/components/charts/ServicesChart'
import PasserTestBanner from '@/components/layout/PasserTestBanner'
import { RULES_TO_HIDE } from '@/constants/documentation'
import { carboneMetric } from '@/constants/model/metric'
import BlockSkeleton from '@/design-system/layout/BlockSkeleton'
import Markdown from '@/design-system/utils/Markdown'
import { useLocale } from '@/hooks/useLocale'
import { useRules } from '@/hooks/useRules'
import { useCurrentSimulation, useDisposableEngine } from '@/publicodes-state'
import type { Metric } from '@/publicodes-state/types'
import { RulePage } from '@publicodes/react-ui'
import Head from 'next/head'
import type Engine from 'publicodes'
import { useState } from 'react'
import MetricSwitchButton from './documentationClient/MetricSwitchButton'

const DocumentationLink = ({
  children,
  to,
}: {
  children: React.ReactNode
  to?: string
}) => <Link href={to || ''}>{children}</Link>

const DocumentationText = ({ children }: { children: string }) => (
  <>
    <Markdown>
      {children
        .replaceAll('<RavijenChart/>', '')
        .replaceAll('<RavijenChartSocietaux/>', '')}
    </Markdown>
    {children.includes('<RavijenChart/>') && <BilanChart />}
    {children.includes('<RavijenChartSocietaux/>') && <ServicesChart />}
  </>
)

interface Props {
  slugs: string[]
}
export default function DocumentationClient({ slugs }: Props) {
  const locale = useLocale()

  const path = decodeURI(slugs.join('/'))
  const documentationPath = '/documentation'

  const { data: rules, isPending } = useRules({ isOptim: false })

  const { situation } = useCurrentSimulation()
  const { engine } = useDisposableEngine({ rules, situation })

  const [metric, setMetric] = useState<Metric>(carboneMetric)

  if (isPending) {
    return <BlockSkeleton />
  }

  return (
    <div className="mt-4 mb-16 w-full px-2">
      <PasserTestBanner />
      <MetricSwitchButton
        metric={metric}
        setMetric={(metric) => {
          setMetric(metric)
          engine.setSituation(
            { métrique: `'${metric}'` },
            { keepPreviousSituation: true }
          )
        }}
      />
      <RulePage
        language={locale as 'fr' | 'en'}
        rulePath={path ?? ''}
        engine={engine as Engine}
        documentationPath={documentationPath}
        searchBar={true}
        rulesToHide={Array.from(RULES_TO_HIDE)}
        renderers={{
          Head,
          Link: DocumentationLink,
          Text: DocumentationText,
        }}
        mainContentId="main-content"
      />
    </div>
  )
}
