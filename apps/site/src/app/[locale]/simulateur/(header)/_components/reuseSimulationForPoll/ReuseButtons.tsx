'use client'

import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { useState } from 'react'

interface Props {
  reuseSimulation: () => void
  createNewSimulation: () => void
}

export default function ReuseButtons({
  reuseSimulation,
  createNewSimulation,
}: Props) {
  const [isClicked, setIsClicked] = useState(false)
  return (
    <div className="flex flex-col items-start gap-6" data-track>
      <Button
        disabled={isClicked}
        showLoadingOnClick
        onClick={() => {
          setIsClicked(true)
          reuseSimulation()
        }}>
        <Trans i18nKey="tutorial.reuseData.useDataButton.label">
          Utiliser mes données existantes
        </Trans>
      </Button>

      <Button
        disabled={isClicked}
        showLoadingOnClick
        color="secondary"
        onClick={() => {
          setIsClicked(true)
          createNewSimulation()
        }}>
        <Trans i18nKey="tutorial.reuseData.newTestButton.label">
          Commencer un nouveau test
        </Trans>
      </Button>
    </div>
  )
}
