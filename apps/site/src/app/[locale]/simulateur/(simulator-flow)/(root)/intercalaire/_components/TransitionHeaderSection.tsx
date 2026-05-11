'use client'

import Trans from '@/components/translation/trans/TransClient'
import { orderedCategories } from '@/constants/model/orderedCategories'
import Title from '@/design-system/layout/Title'
import Emoji from '@/design-system/utils/Emoji'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { usePathname } from 'next/navigation'

const getCategoryString = (
  category: string,
  t: (key: string, defaultValue: string) => string
) => {
  switch (category) {
    case 'logement':
      return t('logement', 'logement')
    case 'alimentation':
      return t('alimentation', 'alimentation')
    case 'transport':
      return t('transport', 'transport')
    default:
      return t('consommation', 'consommation')
  }
}

export default function TransitionHeaderSection() {
  const pathname = usePathname()
  const currentCategory = pathname.split('/').at(-1)

  const { t } = useClientTranslation()

  if (!currentCategory) {
    return null
  }

  const currentIndex = orderedCategories.indexOf(currentCategory as DottedName)
  const remainingSteps =
    currentIndex >= 0
      ? orderedCategories
          .slice(currentIndex + 1)
          .filter((cat) => cat !== 'services sociétaux').length
      : 0

  if (remainingSteps === 0) {
    return (
      <Title tag="h1" hasSeparator={false} className="text-primary-600">
        <Trans
          values={{ category: getCategoryString(currentCategory, t) }}
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
          values={{ category: getCategoryString(currentCategory, t) }}
          i18nKey="simulator.intercalaire.title.default">
          Section {{ currentCategory } as unknown as React.ReactNode} terminée
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
