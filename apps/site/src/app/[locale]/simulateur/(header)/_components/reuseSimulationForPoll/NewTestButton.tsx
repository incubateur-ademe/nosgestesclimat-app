'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { useTransition } from 'react'

interface Props {
  createNewSimulation: () => void
}

export default function NewTestButton({ createNewSimulation }: Props) {
  const [isPending, startTransition] = useTransition()
  return (
    <Button
      disabled={isPending}
      color="secondary"
      onClick={() => startTransition(createNewSimulation)}>
      <Trans>Commencer un nouveau test</Trans>
    </Button>
  )
}
