'use client'

import Trans from '@/components/translation/trans/TransClient'
import Title from '@/design-system/layout/Title'
import Emoji from '@/design-system/utils/Emoji'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { orderedCategoriesWithoutServices } from '../_constants/getOrderedCategoriesWithoutServices'

interface Props {
  category: DottedName
}

const getCategoryString = (
  category: string,
  t: (key: string, defaultValue: string) => string
) => {
  switch (category) {
    case 'logement':
      return t('common.logement', 'logement')
    case 'alimentation':
      return t('common.alimentation', 'alimentation')
    case 'transport':
      return t('common.transport', 'transport')
    default:
      return t('common.consommation', 'consommation')
  }
}

export default function TransitionHeaderSection({ category }: Props) {
  const { t } = useClientTranslation()

  const currentIndex = orderedCategoriesWithoutServices.indexOf(category)

  const remainingSteps = orderedCategoriesWithoutServices
    .slice(currentIndex + 1)
    .filter((cat) => cat !== 'services sociétaux').length

  if (remainingSteps === 0) {
    return (
      <Title tag="h1" hasSeparator={false} className="text-primary-600">
        <Trans
          values={{ category: getCategoryString(category, t) }}
          i18nKey="simulator.intercalaire.title.last">
          Bravo, tu as terminé toutes les sections
        </Trans>{' '}
        <Emoji>🥳</Emoji>
      </Title>
    )
  }

  return (
    <>
      <Title
        tag="h1"
        hasSeparator={false}
        className="text-primary-600 font-medium">
        <Trans
          values={{ category: getCategoryString(category, t) }}
          i18nKey="simulator.intercalaire.title.default">
          Section {{ category } as unknown as React.ReactNode} terminée
        </Trans>{' '}
        <Emoji>✅</Emoji>
      </Title>

      <p className="mb-0">
        {remainingSteps === 1 ? (
          <Trans i18nKey="simulator.intercalaire.subtitle.remaining.one">
            Plus qu'une!
          </Trans>
        ) : (
          <Trans
            values={{ remainingSteps: String(remainingSteps) }}
            i18nKey="simulator.intercalaire.subtitle.remaining.all">
            Plus que {{ remainingSteps } as unknown as string}!
          </Trans>
        )}
      </p>
    </>
  )
}
