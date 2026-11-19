'use client'
import BlockSkeleton from '@/design-system/layout/BlockSkeleton'
import { EngineProvider } from '@/publicodes-state'
import type { NGCRules } from '@incubateur-ademe/nosgestesclimat'
import { isSimulationCompleted } from '@nosgestesclimat/core/features/simulations/helpers/simulation-guards'
import type { Simulation } from '@nosgestesclimat/core/features/simulations/types/simulation'
import dynamic from 'next/dynamic'
import { useContext, type JSX } from 'react'
import { IsDocumentationClientContext } from '../../_contexts/DocumentationStateContext'

interface Props {
  slug: string[]
  serverComponent: JSX.Element
  rules: NGCRules
  currentSimulation?: Simulation
}

const DocumentationClient = dynamic(
  () => import('./documentationRouter/DocumentationClient'),
  {
    ssr: false,
    loading: () => <BlockSkeleton />,
  }
)

export default function DocumentationRouter({
  slug,
  serverComponent,
  rules,
  currentSimulation,
}: Props) {
  const { isDocumentationClient } = useContext(IsDocumentationClientContext)

  if (
    isDocumentationClient ||
    (currentSimulation && isSimulationCompleted(currentSimulation))
  )
    return (
      <EngineProvider
        rules={rules}
        initialSituation={currentSimulation?.situation}>
        <DocumentationClient slugs={slug} />
      </EngineProvider>
    )

  return serverComponent
}
