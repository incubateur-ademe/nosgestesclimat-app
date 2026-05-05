import Trans from '@/components/translation/trans/TransServer'
import Title from '@/design-system/layout/Title'
import Emoji from '@/design-system/utils/Emoji'
import { t } from '@/helpers/metadata/fakeMetadataT'
import type { Locale } from '@/i18nConfig'
import type { Categories } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  category: Categories
  remainingSteps: number
  locale: Locale
}

const getCategoryString = (category: Categories) => {
  switch (category) {
    case 'logement':
      return t('Logement')
    case 'alimentation':
      return t('Alimentation')
    case 'transport':
      return t('Transport')
    default:
      return t('Divers')
  }
}

export default function TransitionHeaderSection({
  category,
  remainingSteps,
  locale,
}: Props) {
  if (remainingSteps === 0) {
    return (
      <Title tag="h1" hasSeparator={false} className="text-primary-600">
        <Trans
          locale={locale}
          values={{ category: getCategoryString(category) }}
          i18nKey="simulator.intercalaire.title">
          Bravo, tu as terminé toutes les sections
        </Trans>{' '}
        <Emoji>🥳</Emoji>
      </Title>
    )
  }

  return (
    <>
      <Title tag="h1" hasSeparator={false} className="text-primary-600">
        <Trans
          locale={locale}
          values={{ category: getCategoryString(category) }}
          i18nKey="simulator.intercalaire.title">
          Section {{ category } as unknown as React.ReactNode} terminée
        </Trans>{' '}
        <Emoji>✅</Emoji>
      </Title>
      <p>
        <Trans
          locale={locale}
          values={{ remainingSteps: String(remainingSteps) }}
          i18nKey="simulator.intercalaire.subtitle.remaining">
          Plus que {{ remainingSteps } as unknown as string}!
        </Trans>
      </p>
    </>
  )
}
