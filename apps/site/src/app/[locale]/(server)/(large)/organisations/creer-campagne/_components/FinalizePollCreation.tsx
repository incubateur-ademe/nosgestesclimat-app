'use client'

import Trans from '@/components/translation/trans/TransClient'
import Loader from '@/design-system/layout/Loader'
import { useEffect, useRef } from 'react'
import { useFinalizeCollectiveTest } from '../_hooks/createPoll'

interface Props {
  orgSlug: string
}

export default function FinalizePollCreation({ orgSlug }: Props) {
  const { finalize, isPending, isError } = useFinalizeCollectiveTest(orgSlug)
  const hasStarted = useRef(false)

  useEffect(() => {
    if (hasStarted.current) {
      return
    }

    hasStarted.current = true
    // finalize()
  }, [finalize])

  if (isError) {
    return (
      <p role="alert" aria-live="polite" className="mt-4 text-red-800">
        <Trans>
          Une erreur s'est produite lors de la création de votre test collectif.
          Veuillez réessayer.
        </Trans>
      </p>
    )
  }

  return (
    <div className="bg-primary-100 flex flex-col items-center justify-center rounded-2xl p-8">
      <Loader color="dark" className="mb-4 inline-block" />
      <p className="font-bold">
        <Trans>Création de votre test collectif en cours</Trans>
        {isPending && '…'}
      </p>
    </div>
  )
}
