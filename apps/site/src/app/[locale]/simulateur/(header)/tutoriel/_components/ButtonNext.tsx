'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { useActionState } from 'react'
import { startSimulation } from '../_actions/start-simulation.action'

export default function ButtonNext() {
  const [, action, pending] = useActionState(startSimulation, undefined)

  return (
    <form action={action}>
      <Button
        loading={pending}
        type="submit"
        data-testid="skip-tutorial-button"
        className="min-w-42!">
        <Trans i18nKey="simulator.tutorial.letsGoButton.label">
          C'est parti !
        </Trans>{' '}
        <span aria-hidden="true" className="ml-1">
          →
        </span>
      </Button>
    </form>
  )
}
