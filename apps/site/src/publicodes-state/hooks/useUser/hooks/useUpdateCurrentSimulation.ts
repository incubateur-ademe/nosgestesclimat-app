'use client'

import { getInitialExtendedSituation } from '@/helpers/modelFetching/getInitialExtendedSituation'
import type { Simulation } from '@/helpers/server/model/simulations'
import type {
  DottedName,
  ExtendedSituation,
  NodeValue,
} from '@incubateur-ademe/nosgestesclimat'
import type { Dispatch, SetStateAction } from 'react'
import { useCallback } from 'react'
import type { UpdateCurrentSimulationProps } from '../../../types'

interface Props {
  setSimulation: Dispatch<SetStateAction<Simulation | undefined>>
}

/**
 * Updates the current simulation in place. A no-op when there is none: a
 * simulation only exists once persisted server-side.
 */
export default function useUpdateCurrentSimulation({ setSimulation }: Props) {
  return useCallback(
    ({
      situation,
      foldedSteps,
      foldedStepToAdd,
      actionChoices,
      computedResults,
      progression,
      groupToDelete,
    }: UpdateCurrentSimulationProps) => {
      setSimulation((prevSimulation) => {
        if (!prevSimulation) return prevSimulation

        const simulationToUpdate = { ...prevSimulation }

        // Ensure extendedSituation is always defined (for old simulations that might not have it)
        if (!simulationToUpdate.extendedSituation) {
          simulationToUpdate.extendedSituation = getInitialExtendedSituation()
        }

        if (situation !== undefined) {
          // We sync the extendedSituation with the situation detecting added, modified or removed dottedNames from the updated situation.

          const situationKeys = Object.keys(situation)
          const situationKeySet = new Set(situationKeys)

          const simulationToUpdateSituationKeys = Object.keys(
            simulationToUpdate.situation
          )
          const simulationToUpdateSituationKeysSet = new Set(
            simulationToUpdateSituationKeys
          )

          const addedOrChangedDottedNames = situationKeys.reduce(
            (acc, dottedName) => {
              if (
                dottedName in simulationToUpdate.extendedSituation &&
                (!simulationToUpdateSituationKeysSet.has(dottedName) ||
                  situation[dottedName as DottedName] !==
                    simulationToUpdate.situation[dottedName as DottedName])
              ) {
                acc[dottedName as keyof ExtendedSituation] = {
                  source: 'answered',
                  nodeValue: situation[dottedName as DottedName] as NodeValue,
                }
              }
              return acc
            },
            {} as Partial<ExtendedSituation>
          )

          const removedDottedNames = simulationToUpdateSituationKeys.reduce(
            (acc, dottedName) => {
              if (!situationKeySet.has(dottedName)) {
                acc[dottedName as keyof ExtendedSituation] = {
                  source: 'omitted',
                }
              }
              return acc
            },
            {} as Partial<ExtendedSituation>
          )

          simulationToUpdate.extendedSituation = {
            ...simulationToUpdate.extendedSituation,
            ...addedOrChangedDottedNames,
            ...removedDottedNames,
          } as ExtendedSituation

          simulationToUpdate.situation = situation
        }

        if (foldedSteps !== undefined) {
          // We sync the extendedSituation if foldedSteps are removed. If foldedStep is added, it is dealt with foldedStepToAdd.
          const removedDottedNames = simulationToUpdate.foldedSteps.filter(
            (dottedName) => !foldedSteps.includes(dottedName)
          )
          removedDottedNames.forEach((dottedName) => {
            simulationToUpdate.extendedSituation[
              dottedName as keyof ExtendedSituation
            ] = {
              source: 'omitted',
            }
          })
          simulationToUpdate.foldedSteps = foldedSteps
        }

        if (foldedStepToAdd !== undefined) {
          if (
            !simulationToUpdate.foldedSteps.includes(
              foldedStepToAdd.foldedStep
            ) &&
            !foldedStepToAdd.isMosaicChild
          ) {
            simulationToUpdate.foldedSteps = [
              ...(simulationToUpdate.foldedSteps || []),
              foldedStepToAdd.foldedStep,
            ]
          }

          if (!foldedStepToAdd.isMosaicParent) {
            simulationToUpdate.extendedSituation[
              foldedStepToAdd.foldedStep as keyof ExtendedSituation
            ] = {
              source: 'default',
              nodeValue:
                foldedStepToAdd.value !== undefined &&
                foldedStepToAdd.value !== null
                  ? foldedStepToAdd.value
                  : 'non défini',
            }
          }
        }

        if (actionChoices !== undefined) {
          simulationToUpdate.actionChoices = actionChoices
        }

        if (computedResults !== undefined) {
          simulationToUpdate.computedResults = computedResults
        }

        if (progression !== undefined) {
          simulationToUpdate.progression = progression
        }

        if (groupToDelete && simulationToUpdate.groups) {
          simulationToUpdate.groups = simulationToUpdate.groups.filter(
            (group) => group.id !== groupToDelete
          )
        }

        return simulationToUpdate
      })
    },
    [setSimulation]
  )
}
