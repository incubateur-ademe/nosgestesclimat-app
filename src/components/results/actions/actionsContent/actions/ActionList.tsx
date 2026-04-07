'use client'

import { actionsClickYes } from '@/constants/tracking/pages/actions'
import Modal from '@/design-system/modals/Modal'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import {
  FormProvider,
  useCurrentSimulation,
  useEngine,
  useUser,
} from '@/publicodes-state'
import type { Action } from '@/publicodes-state/types'
import { trackMatomoEvent__deprecated } from '@/utils/analytics/trackEvent'
import type {
  NGCRuleNode,
  NGCRules,
  NodeValue,
} from '@incubateur-ademe/nosgestesclimat'
import { Fragment, useEffect, useRef, useState } from 'react'
import ActionCard from './ActionCard'
import ActionForm from './ActionForm'

interface Props {
  actions: Action[]
  rules: Partial<NGCRules>
  bilan: { nodeValue: NodeValue; dottedName: string }
  actionWithFormOpen: string
  setActionWithFormOpen: (dottedName: string) => void
  shouldUpdatePersistedActions: boolean
  setShouldUpdatePersistedActions: (value: boolean) => void
  ariaLabelledBy?: string
  listId?: string
}

export default function ActionList({
  actions,
  rules,
  bilan,
  actionWithFormOpen,
  setActionWithFormOpen,
  shouldUpdatePersistedActions,
  setShouldUpdatePersistedActions,
  ariaLabelledBy,
  listId,
}: Props) {
  const { getCategory } = useEngine()
  const { toggleActionChoice } = useUser()

  const { actionChoices } = useCurrentSimulation()

  const { t } = useClientTranslation()

  // This allows us to keep actions displayed even after they have been
  // made unapplicable
  const [actionsPersisted, setActionsPersisted] = useState(actions)

  const handleUpdatePersistedActions = () => {
    setShouldUpdatePersistedActions(true)
  }

  const prevActionWithFormOpen = useRef(actionWithFormOpen)

  useEffect(() => {
    if (actionWithFormOpen && !prevActionWithFormOpen.current) {
      prevActionWithFormOpen.current = actionWithFormOpen
    }
  }, [actionWithFormOpen])

  useEffect(() => {
    if (shouldUpdatePersistedActions) {
      setActionsPersisted(actions)
      setShouldUpdatePersistedActions(false)
    }
  }, [actions, setShouldUpdatePersistedActions, shouldUpdatePersistedActions])

  // Handle scrolling after actions have been updated
  useEffect(() => {
    if (prevActionWithFormOpen.current && actionsPersisted.length > 0) {
      requestAnimationFrame(() => {
        const element = document.getElementById(prevActionWithFormOpen.current)
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          })
        }
        prevActionWithFormOpen.current = ''
      })
    }
  }, [actionsPersisted])

  // Inline positioning replaced by accessible modal managed by design-system

  return (
    <ul
      id={listId}
      className="mt-4 flex list-none flex-wrap items-center justify-center p-0"
      aria-labelledby={ariaLabelledBy}
      role="list">
      {actionsPersisted.reduce<React.ReactNode[]>((acc, action) => {
        const isActionFocused = actionWithFormOpen === action.dottedName

        const cardComponent = (
          <div>
            <ActionCard
              setActionWithFormOpen={setActionWithFormOpen}
              isFocused={isActionFocused}
              rule={
                rules[action.dottedName]
                  ? (rules[action.dottedName] as NGCRuleNode)
                  : undefined
              }
              action={action}
              total={typeof bilan?.nodeValue === 'number' ? bilan.nodeValue : 0}
              handleUpdatePersistedActions={handleUpdatePersistedActions}
            />
          </div>
        )

        acc.push(
          <Fragment key={action.dottedName}>
            <li className="relative m-2 w-[12rem]">
              {cardComponent}

              {isActionFocused && (
                <Modal
                  isOpen
                  ariaLabel={t(
                    'actions.form.modal.ariaLabel',
                    "Fenêtre modale du formulaire d'action"
                  )}
                  closeModal={() => setActionWithFormOpen('')}
                  hasAbortButton={false}
                  hasAbortCross>
                  <div className="w-full max-w-[40rem]">
                    <FormProvider root={action.dottedName}>
                      <ActionForm
                        key={action.dottedName}
                        action={action}
                        category={getCategory(action.dottedName)}
                        onComplete={() => {
                          toggleActionChoice(action.dottedName)

                          if (!actionChoices[action.dottedName]) {
                            trackMatomoEvent__deprecated(
                              actionsClickYes(action.dottedName)
                            )
                          }
                          setActionWithFormOpen('')
                        }}
                        handleUpdatePersistedActions={
                          handleUpdatePersistedActions
                        }
                      />
                    </FormProvider>
                  </div>
                </Modal>
              )}
            </li>
          </Fragment>
        )

        return acc
      }, [])}
    </ul>
  )
}
