'use client'

import Trans from '../translation/trans/TransClient'

interface Props {
  currentStep: number
  totalSteps?: number
}

export default function StepsDisplay({ currentStep, totalSteps = 2 }: Props) {
  return (
    <p className="text-secondary-700 mb-2 text-sm font-bold">
      <Trans>Étape</Trans> {currentStep} <Trans>sur</Trans> {totalSteps}
    </p>
  )
}
