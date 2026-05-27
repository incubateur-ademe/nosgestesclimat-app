'use client'

import Trans from '@/components/translation/trans/TransClient'
import { AGE_RANGE_KEY } from '@/constants/ab-test'
import { AGE_PAGE_PATH, SIMULATOR_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { useFeatureFlag } from '@/hooks/useFeatureFlag'

interface Props {
  hasSelectedAgeRange?: boolean
}

export default function ButtonNext({ hasSelectedAgeRange }: Props) {
  const redirectToAgePage =
    useFeatureFlag(AGE_RANGE_KEY) && !hasSelectedAgeRange

  return (
    <ButtonLink
      href={redirectToAgePage ? AGE_PAGE_PATH : SIMULATOR_PATH}
      data-testid="skip-tutorial-button"
      className="min-w-42!">
      <Trans i18nKey="simulator.tutorial.letsGoButton.label">
        C'est parti !
      </Trans>{' '}
      <span aria-hidden="true" className="ml-1">
        →
      </span>
    </ButtonLink>
  )
}
