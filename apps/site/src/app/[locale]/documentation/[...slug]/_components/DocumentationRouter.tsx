'use client'
import BlockSkeleton from '@/design-system/layout/BlockSkeleton'
import type { Simulation } from '@/helpers/server/model/simulations'
import { EngineProvider } from '@/publicodes-state'
import type { NGCRules } from '@incubateur-ademe/nosgestesclimat'
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
    (currentSimulation && currentSimulation.progression > 0)
  )
    return (
      <EngineProvider rules={rules}>
        <DocumentationClient
          slugs={slug}
          currentSimulation={currentSimulation}
        />
      </EngineProvider>
    )

  return serverComponent
}
