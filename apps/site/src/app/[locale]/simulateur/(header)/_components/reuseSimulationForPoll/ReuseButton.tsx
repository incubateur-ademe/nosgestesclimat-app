'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { useTransition } from 'react'

interface Props {
  reuseSimulation: () => void
}

export default function ReuseButton({ reuseSimulation }: Props) {
  const [isPending, startTransition] = useTransition()

  return (
    <Button
      disabled={isPending}
      onClick={() => startTransition(reuseSimulation)}>
      <Trans>Utiliser mes données existantes</Trans>
    </Button>
  )
}
