'use client'

import { IsDocumentationClientContext } from '@/app/[locale]/documentation/_contexts/DocumentationStateContext'
import Trans from '@/components/translation/trans/TransClient'
import Button from '@/design-system/buttons/Button'
import { useContext } from 'react'

export default function ButtonLaunch() {
  const { setIsDocumentationClient } = useContext(IsDocumentationClientContext)

  return (
    <Button
      onClick={() => setIsDocumentationClient(true)}
      data-testid="documentation-launch-button">
      <Trans>Lancer le calcul</Trans>
    </Button>
  )
}
