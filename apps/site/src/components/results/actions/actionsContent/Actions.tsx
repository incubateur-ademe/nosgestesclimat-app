'use client'

import Trans from '@/components/translation/trans/TransClient'
import Card from '@/design-system/layout/Card'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useCurrentSimulation, useEngine } from '@/publicodes-state'
import type { Action } from '@/publicodes-state/types'
import { getCorrectedValue } from '@/utils/getCorrectedValue'
import type { DottedName, NGCRules } from '@incubateur-ademe/nosgestesclimat'
import Image from 'next/image'
import { useState } from 'react'
import ActionList from './actions/ActionList'
import AllerPlusLoin from './actions/AllerPlusLoin'

interface Props {
  actions: Action[]
  rules: Partial<NGCRules>
  radical: boolean
}

export default function Actions({
  actions: rawActions,
  radical,
  rules,
}: Props) {
  const [actionWithFormOpen, setActionWithFormOpen] = useState<string>('')
  const [shouldUpdatePersistedActions, setShouldUpdatePersistedActions] =
    useState(false)

  const { t } = useClientTranslation()
  const { getValue } = useEngine()

  const bilan = { nodeValue: getValue('bilan'), dottedName: 'bilan' }

  const { actionChoices } = useCurrentSimulation()

  // Don't render if engine is not initialized or if bilan is not available
  if (bilan.nodeValue == null) {
    return null
  }

  const thresholds: [number, string][] = [
    [10000, t('plus de 10 tonnes')],
    [1000, t("plus d'1 tonne")],
    [100, t('plus de 100 kg')],
    [10, t('plus de 10 kg')],
    [1, t("plus d'1 kg")],
  ]

  const actions = rawActions.map((action) => ({
    ...action,
    value: getCorrectedValue(action),
  })) as Action[]

  const rejected = actions.filter(
    (action) => actionChoices?.[action.dottedName] === false
  )

  const notRejected = actions.filter(
    (action) => actionChoices?.[action.dottedName] !== false
  )

  const maxImpactAction = notRejected.reduce(
    (max, action) => ((action.value ?? 0) > (max.value ?? 0) ? action : max),
    {
      value: 0,
      dottedName: '' as DottedName,
    }
  )

  const numberedActions = thresholds.map(([threshold, label], index) => {
    const thresholdActions = notRejected.filter((action) => {
      return (
        action.value &&
        action.value >= threshold &&
        (index === 0 || action.value < thresholds[index - 1][0])
      )
    })

    if (!thresholdActions.length) return null

    const headingId = `actions-threshold-${threshold}`
    const listId = `actions-list-${threshold}`

    return (
      <section
        key={label}
        className="flex flex-col"
        aria-labelledby={headingId}>
        <div className="order-1 my-4 h-8 w-full text-center">
          <h2
            id={headingId}
            className="bg-primary-700 inline-block rounded-md px-4 py-1 text-sm font-medium text-white"
            aria-describedby={`${headingId}-description`}>
            <span>{label}</span>
            <span
              role="img"
              aria-label={t(
                'actions.thresholdIcon.ariaLabel',
                'Les actions se trouvent en dessous'
              )}
              aria-hidden="true">
              &#9650;
            </span>
          </h2>
          <div id={`${headingId}-description`} className="sr-only">
            {t(
              'actions.thresholdDescription',
              'Actions avec un impact de {{label}} ou plus',
              {
                label,
              }
            )}
          </div>
        </div>

        <div className="-order-1">
          <ActionList
            actions={thresholdActions}
            rules={rules}
            bilan={bilan}
            actionWithFormOpen={actionWithFormOpen}
            setActionWithFormOpen={setActionWithFormOpen}
            shouldUpdatePersistedActions={shouldUpdatePersistedActions}
            setShouldUpdatePersistedActions={setShouldUpdatePersistedActions}
            ariaLabelledBy={headingId}
            listId={listId}
          />
        </div>
      </section>
    )
  })

  return (
    <>
      {maxImpactAction.value && maxImpactAction.value < 100 && (
        <Card className="my-8">
          <Trans i18nKey={'publicodes.AllActions.msgPlusActions'}>
            <p>
              Nous n'avons plus d'actions chiffrées très impactantes à vous
              proposer 🤷
            </p>
            <p className="mb-0">
              Découvrez plus bas quelques pistes pour agir autrement ⏬
            </p>
          </Trans>
        </Card>
      )}

      {radical ? numberedActions : numberedActions.slice().reverse()}

      <section
        className="my-4 h-8 w-full text-center"
        aria-labelledby="engagement-actions-heading">
        <h2
          id="engagement-actions-heading"
          className="bg-primary-700 inline-flex items-center rounded-full px-4 text-sm font-medium text-white"
          aria-describedby="engagement-actions-description">
          <Image
            src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/270_A_cc8d6cb2b7.svg"
            className="mr-2 align-middle invert"
            height={36}
            width={36}
            alt={t(
              'actions.engagementIcon.alt',
              "Icône représentant les actions d'engagement"
            )}
          />
          <Trans>Actions d'engagement</Trans>{' '}
          <span
            role="img"
            aria-label={t(
              'actions.engagementIcon.ariaLabel',
              'Les actions se trouvent en dessous'
            )}
            aria-hidden="true">
            &#9660;
          </span>
        </h2>
        <div id="engagement-actions-description" className="sr-only">
          {t(
            'actions.engagementDescription',
            "Actions d'engagement pour réduire votre empreinte carbone"
          )}
        </div>
      </section>

      <ActionList
        actions={notRejected.filter((action) => action.value === undefined)}
        rules={rules}
        bilan={bilan}
        setActionWithFormOpen={setActionWithFormOpen}
        actionWithFormOpen={actionWithFormOpen}
        shouldUpdatePersistedActions={shouldUpdatePersistedActions}
        setShouldUpdatePersistedActions={setShouldUpdatePersistedActions}
        ariaLabelledBy="engagement-actions-heading"
        listId="engagement-actions-list"
      />

      <section
        className="my-4 h-8 w-full text-center"
        aria-labelledby="negative-actions-heading">
        <h2
          id="negative-actions-heading"
          className="bg-primary-700 inline-flex items-center rounded-full px-4 text-sm font-medium text-white"
          aria-describedby="negative-actions-description">
          <Image
            src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/26_D4_0bb5aeaf38.svg"
            className="mr-2 invert"
            height={36}
            width={36}
            alt={t(
              'actions.negativeIcon.alt',
              'Icône représentant les actions négatives'
            )}
          />
          <Trans>Actions négatives</Trans>{' '}
          <span
            role="img"
            aria-label={t(
              'actions.negativeIcon.ariaLabel',
              'Les actions se trouvent en dessous'
            )}
            aria-hidden="true">
            &#9660;
          </span>
        </h2>
        <div id="negative-actions-description" className="sr-only">
          {t(
            'actions.negativeDescription',
            'Actions qui augmentent votre empreinte carbone'
          )}
        </div>
      </section>

      <ActionList
        actions={notRejected.filter((a) => a.value < 0)}
        rules={rules}
        bilan={bilan}
        setActionWithFormOpen={setActionWithFormOpen}
        actionWithFormOpen={actionWithFormOpen}
        shouldUpdatePersistedActions={shouldUpdatePersistedActions}
        setShouldUpdatePersistedActions={setShouldUpdatePersistedActions}
        ariaLabelledBy="negative-actions-heading"
        listId="negative-actions-list"
      />

      {rejected.length > 0 && (
        <div>
          <h2 className="bg-white">
            <Trans>Actions écartées :</Trans>
          </h2>
          <ActionList
            actions={rejected}
            rules={rules}
            bilan={bilan}
            setActionWithFormOpen={setActionWithFormOpen}
            actionWithFormOpen={actionWithFormOpen}
            shouldUpdatePersistedActions={shouldUpdatePersistedActions}
            setShouldUpdatePersistedActions={setShouldUpdatePersistedActions}
          />
        </div>
      )}

      <AllerPlusLoin />
    </>
  )
}
