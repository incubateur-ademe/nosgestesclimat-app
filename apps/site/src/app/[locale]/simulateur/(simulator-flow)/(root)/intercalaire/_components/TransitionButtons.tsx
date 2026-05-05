'use client'
import Trans from '@/components/translation/trans/TransClient'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useGotoNextQuestion } from '@/publicodes-state/hooks/useGotoNextQuestion/useGotoNextQuestion'
import type { Categories } from '@incubateur-ademe/nosgestesclimat'
import { useRouter } from 'next/navigation'

interface Props {
  nextCategory: Categories
}

export default function TransitionButtons({ nextCategory }: Props) {
  const router = useRouter()

  const gotoNextQuestion = useGotoNextQuestion()

  const { t } = useClientTranslation()

  const getCategoryString = (category: Categories) => {
    switch (category) {
      case 'logement':
        return t('au logement')
      case 'alimentation':
        return t("à l'alimentation")
      case 'transport':
        return t('au transport')
      default:
        return t('à la consommation diverse')
    }
  }

  const handleGoToNextQuestion = () => {
    gotoNextQuestion()
    router.push(SIMULATOR_PATH)
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row">
      <Button color="secondary" onClick={() => router.back()}>
        <span aria-hidden className="mr-1 hidden md:inline-block">
          ←
        </span>
        <Trans i18nKey="common.previous">Précédent</Trans>
      </Button>

      <Button onClick={handleGoToNextQuestion}>
        <Trans
          values={{ nextCategory: getCategoryString(nextCategory) }}
          i18nKey="simulator.intercalaire.nextButton.">
          Passer {{ nextCategory } as unknown as string}
        </Trans>{' '}
        <span aria-hidden className="ml-1 inline-block">
          →
        </span>
      </Button>
    </div>
  )
}
