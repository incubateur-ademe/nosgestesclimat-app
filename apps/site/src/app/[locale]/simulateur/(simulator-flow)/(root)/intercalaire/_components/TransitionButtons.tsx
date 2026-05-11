'use client'

import Trans from '@/components/translation/trans/TransClient'
import { orderedCategories } from '@/constants/model/orderedCategories'
import { SIMULATOR_PATH } from '@/constants/urls/paths'
import Button from '@/design-system/buttons/Button'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useFormState } from '@/publicodes-state'
import type { Categories, DottedName } from '@incubateur-ademe/nosgestesclimat'
import { usePathname, useRouter } from 'next/navigation'
import { useEndTest } from '../../[root]/_hooks/useEndPage'

export default function TransitionButtons() {
  const router = useRouter()

  const pathname = usePathname()
  const category = pathname.split('/').at(-1)

  const { gotoNextQuestion } = useFormState()

  const { endTest, isPending } = useEndTest()

  const { t } = useClientTranslation()

  const nextCategory: Categories | undefined = (() => {
    const currentIndex = orderedCategories.indexOf(category as DottedName)
    if (currentIndex === -1) return undefined
    return orderedCategories[currentIndex + 1] as Categories | undefined
  })()

  const isLastCategory =
    orderedCategories[orderedCategories.length - 1] === category

  const getCategoryString = (category: Categories) => {
    switch (category) {
      case 'logement':
        return t('simulator.intercalaire.goToLogement', 'Passer au logement')
      case 'alimentation':
        return t(
          'simulator.intercalaire.goToAlimentation',
          "Passer à l'alimentation"
        )
      case 'transport':
        return t('simulator.intercalaire.goToTransport', 'Passer au transport')
      default:
        return t(
          'simulator.intercalaire.goToConsommation',
          'Passer à la consommation'
        )
    }
  }

  const handleGoToNextQuestion = () => {
    if (isLastCategory) {
      endTest()
      return
    }

    if (!nextCategory) {
      endTest()
      return
    }

    gotoNextQuestion()
    router.push(SIMULATOR_PATH)
  }

  return (
    <div className="my-8 flex gap-4 md:flex-row">
      <Button
        title={t(
          'common.previousExtended',
          'Précédent, revenir à la page précédente'
        )}
        className="h-full w-14 md:w-auto"
        color="secondary"
        onClick={() => router.back()}
        disabled={isPending}>
        <span aria-hidden className="text-xl md:mr-1.5">
          ←
        </span>
        <span className="sr-only md:not-sr-only">
          <Trans i18nKey="common.previous">Précédent</Trans>
        </span>
      </Button>

      <Button onClick={handleGoToNextQuestion} disabled={isPending}>
        {isLastCategory || !nextCategory ? (
          <Trans i18nKey="simulator.intercalaire.seeResults">
            Voir mes résultats
          </Trans>
        ) : (
          getCategoryString(nextCategory)
        )}
        <span aria-hidden className="ml-1.5 inline-block text-xl">
          →
        </span>
      </Button>
    </div>
  )
}
