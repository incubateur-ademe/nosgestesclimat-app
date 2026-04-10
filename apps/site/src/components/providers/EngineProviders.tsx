'use client'

import LocalisationBanner from '@/components/translation/LocalisationBanner'
import { useRules } from '@/hooks/useRules'
import { EngineProvider, useCurrentSimulation } from '@/publicodes-state'
import supportedRegions from '@incubateur-ademe/nosgestesclimat/public/supportedRegions.json'
import type { PropsWithChildren } from 'react'
import { Suspense, useState } from 'react'
import Error500 from '../layout/500'
import PRNumberHook from './simulationProviders/PRNumberHook'

interface Props {
  isOptim?: boolean
}

export default function EngineProviders({
  children,
  isOptim = true,
}: PropsWithChildren<Props>) {
  const { id } = useCurrentSimulation()

  const [PRNumber, setPRNumber] = useState<string | undefined>(undefined)

  const { data: rules, isLoading, isFetched } = useRules({ isOptim, PRNumber })

  if (isLoading) {
    return children
  }

  if (!rules && isFetched) {
    return <Error500 />
  }

  return (
    <div key={id}>
      <EngineProvider rules={rules}>
        <Suspense fallback={null}>
          <PRNumberHook setPRNumber={setPRNumber} />
        </Suspense>

        <LocalisationBanner supportedRegions={supportedRegions} />

        {children}
      </EngineProvider>
    </div>
  )
}
