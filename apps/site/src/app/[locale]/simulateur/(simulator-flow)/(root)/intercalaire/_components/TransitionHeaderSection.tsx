'use client'

import Trans from '@/components/translation/trans/TransClient'
import Title from '@/design-system/layout/Title'
import Emoji from '@/design-system/utils/Emoji'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useFormState } from '@/publicodes-state'
import type { Categories } from '@incubateur-ademe/nosgestesclimat/types/categories'
import { useState } from 'react'

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
    case 'consommation':
      return t('common.consommation', 'consommation')
  }
}

export default function TransitionHeaderSection() {
  const { t } = useClientTranslation()
  const [{ remainingCategories, currentCategory }] = useState(useFormState())
  const category = currentCategory as Categories
  if (remainingCategories === 0) {
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
          Section {{ category: category } as unknown as React.ReactNode}{' '}
          terminée
        </Trans>{' '}
        <Emoji>✅</Emoji>
      </Title>

      <p className="mb-0">
        {remainingCategories === 1 ? (
          <Trans i18nKey="simulator.intercalaire.subtitle.remaining.one">
            Plus qu'une!
          </Trans>
        ) : (
          <Trans
            values={{ remainingCategories: String(remainingCategories) }}
            i18nKey="simulator.intercalaire.subtitle.remaining.all">
            Plus que {{ remainingCategories } as unknown as string} !
          </Trans>
        )}
      </p>
    </>
  )
}
