'use client'

import ActionForm from '@/components/results/actions/actionsContent/actions/ActionForm'
import Trans from '@/components/translation/trans/TransClient'
import {
  actionsClickUnderstandCalculation,
  actionsClickYes,
} from '@/constants/tracking/pages/actions'
import {
  captureActionsClickUnderstandCalculation,
  captureActionsClickYes,
} from '@/constants/tracking/posthogTrackers'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import Card from '@/design-system/layout/Card'
import Markdown from '@/design-system/utils/Markdown'
import { filterRelevantMissingVariables } from '@/helpers/actions/filterRelevantMissingVariables'
import {
  FormProvider,
  useCurrentSimulation,
  useEngine,
  useRule,
  useTempEngine,
  useUser,
} from '@/publicodes-state'
import type { Action } from '@/publicodes-state/types'
import {
  trackMatomoEvent__deprecated,
  trackPosthogEvent,
} from '@/utils/analytics/trackEvent'
import { encodeRuleName } from '@/utils/publicodes/encodeRuleName'
import type { DottedName, NGCRuleNode } from '@incubateur-ademe/nosgestesclimat'
import { utils } from 'publicodes'
import { useState } from 'react'

const { decodeRuleName } = utils

export default function ActionDetail({
  pathParamsDottedName,
}: {
  pathParamsDottedName: string[]
}) {
  const {
    getCategory,
    rawMissingVariables,
    safeEvaluate,
    everyQuestions,
    everyMosaicChildrenWithParent,
  } = useEngine()

  const formattedDottedName = pathParamsDottedName
    .map(decodeURIComponent)
    .join(' . ')

  const { rules, getSpecialRuleObject, extendedFoldedSteps } = useTempEngine()

  const { toggleActionChoice } = useUser()

  const { actionChoices } = useCurrentSimulation()

  const dottedName = decodeRuleName(formattedDottedName) as DottedName

  const remainingQuestions = filterRelevantMissingVariables({
    missingVariables: Object.keys(
      getSpecialRuleObject(dottedName).missingVariables || {}
    ) as DottedName[],
    extendedFoldedSteps,
    everyQuestions,
    rawMissingVariables,
    safeEvaluate,
    everyMosaicChildrenWithParent,
  })

  const rule = useRule(dottedName)

  const [persistedRemainingQuestions, setPersistedRemainingQuestions] =
    useState<DottedName[] | undefined>(remainingQuestions)

  if (!rules) {
    return null
  }

  const { title } = rule

  const { description, icônes: icons } = rules[dottedName] ?? {}

  const flatActions = rules.actions as { formule: { somme: DottedName[] } }

  const relatedActions: NGCRuleNode[] = flatActions?.formule?.somme
    ?.filter(
      (action: DottedName) =>
        action !== dottedName && getCategory(dottedName) === getCategory(action)
    )
    ?.map((name: DottedName) => getSpecialRuleObject(name))

  return (
    <>
      <Card className="mt-4">
        <header className="mb-4">
          <h2 className="flex items-center gap-2">
            {icons && <span className="flex">{icons}</span>}
            {title}
          </h2>
        </header>
        <div>
          <Markdown>{description ?? ''}</Markdown>

          <div className="mt-8">
            <ButtonLink
              color="secondary"
              href={`/documentation/${encodeRuleName(dottedName)}`}
              onClick={() => {
                trackMatomoEvent__deprecated(
                  actionsClickUnderstandCalculation(dottedName)
                )
                trackPosthogEvent(
                  captureActionsClickUnderstandCalculation({
                    action: dottedName,
                  })
                )
              }}>
              <span role="img" aria-hidden className="mr-3 text-xl">
                📚
              </span>
              <Trans>Comprendre le calcul</Trans>
            </ButtonLink>
          </div>
        </div>
      </Card>

      {persistedRemainingQuestions &&
        persistedRemainingQuestions.length > 0 && (
          <>
            <h3 className="mt-4">
              <Trans>Personnalisez cette estimation</Trans>
            </h3>

            <FormProvider root={dottedName}>
              <ActionForm
                key={dottedName}
                category={getCategory(dottedName)}
                onComplete={() => {
                  toggleActionChoice(dottedName)

                  setPersistedRemainingQuestions(undefined)

                  if (!actionChoices[dottedName]) {
                    trackMatomoEvent__deprecated(actionsClickYes(dottedName))
                    trackPosthogEvent(
                      captureActionsClickYes({ action: dottedName })
                    )
                  }
                }}
                action={{ ...rule, dottedName } as unknown as Action}
              />
            </FormProvider>
          </>
        )}

      {relatedActions && (
        <div className="mt-8">
          <h3>
            <Trans>Sur le même sujet</Trans>
          </h3>
          <ul className="flex flex-wrap gap-2">
            {relatedActions.map((action, index) => (
              <li key={`relatedAction${index}`}>
                <ButtonLink
                  color="secondary"
                  href={`/actions/${encodeRuleName(action.dottedName)}`}
                  size="sm">
                  {action.title}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
