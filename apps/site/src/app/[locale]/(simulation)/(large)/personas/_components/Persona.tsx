'use client'

import Trans from '@/components/translation/trans/TransClient'
import { metrics } from '@/constants/model/metric'
import Button from '@/design-system/buttons/Button'
import Card from '@/design-system/layout/Card'
import { fixSituationWithPartialMosaic } from '@/helpers/personas/fixSituationWithPartialMosaic'
import { getPersonaFoldedSteps } from '@/helpers/personas/getPersonaFoldedSteps'
import { generateSimulation } from '@/helpers/simulation/generateSimulation'
import { useSaveSimulation } from '@/hooks/simulation/useSaveSimulation'
import { useEngine, useUser } from '@/publicodes-state'
import { getComputedResults } from '@/publicodes-state/helpers/getComputedResults'
import type {
  DottedName,
  Persona as PersonaType,
} from '@incubateur-ademe/nosgestesclimat'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

interface Props {
  persona: PersonaType
  personaDottedName: string
}

export default function Persona({ persona, personaDottedName }: Props) {
  const router = useRouter()

  const { initSimulation, hideTutorial, currentSimulation } = useUser()

  const {
    pristineEngine,
    everyMosaicChildrenWithParent,
    everyQuestions,
    everyRules,
    safeEvaluate,
    safeGetRule,
    getNumericValue,
    categories,
    subcategories,
  } = useEngine()

  const { saveSimulation } = useSaveSimulation()

  const [isPending, startTransition] = useTransition()

  const isCurrentPersonaSelected =
    currentSimulation.persona === personaDottedName

  return (
    <Card
      className={`${
        isCurrentPersonaSelected
          ? 'border-2! border-green-500 bg-green-200'
          : 'bg-primary-50 border-none'
      } items-center`}>
      <div className="text-lg">{persona['icônes']}</div>

      <h2>{persona.nom}</h2>

      <p className="text-center text-sm">
        {persona['résumé'] ?? persona.description}
      </p>

      {!isCurrentPersonaSelected && (
        <Button
          size="sm"
          className="align-self-end mt-auto"
          disabled={isPending}
          onClick={() => {
            startTransition(() => {
              const fixedSituation = fixSituationWithPartialMosaic({
                situation: persona.situation,
                everyMosaicChildrenWithParent,
                safeGetRule,
                safeEvaluate,
              })

              const engineCopy = pristineEngine?.shallowCopy() ?? null

              const simulation = generateSimulation({
                situation: fixedSituation,
                persona: personaDottedName,
                computedResults: getComputedResults({
                  metrics,
                  categories,
                  subcategories,
                  getNumericValue,
                }),
                foldedSteps: getPersonaFoldedSteps({
                  situation: persona.situation,
                  everyMosaicChildrenWithParent,
                  everyQuestions,
                  everyRules,
                  engine: engineCopy,
                  safeGetRule,
                  safeEvaluate,
                }) as DottedName[],
                progression: 1,
              })

              initSimulation(simulation)
              saveSimulation({ simulation })
              hideTutorial('testIntro')
              router.refresh()
            })
          }}>
          {isPending ? (
            <Trans>Chargement...</Trans>
          ) : (
            <Trans>Sélectionner</Trans>
          )}
        </Button>
      )}

      {isCurrentPersonaSelected && (
        <p className="align-self-end mt-auto mb-0 p-1 text-sm font-bold">
          <Trans>Sélectionné·e</Trans>
        </p>
      )}
    </Card>
  )
}
