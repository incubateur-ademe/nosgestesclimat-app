import type { Simulation } from '@/helpers/server/model/simulations'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { UpdateCurrentSimulationProps } from '../../../types'

interface Props {
  /** Absent until a simulation has been persisted — both actions are no-ops then. */
  currentSimulation: Simulation | undefined
  updateCurrentSimulation: (simulation: UpdateCurrentSimulationProps) => void
}
export default function useActions({
  currentSimulation,
  updateCurrentSimulation,
}: Props) {
  const toggleActionChoice = (actionChoiceDottedName: DottedName) => {
    if (!currentSimulation) return

    const isActionSelected = Object.keys(
      currentSimulation.actionChoices || {}
    ).some(
      (actionChoiceKey: string) => actionChoiceKey === actionChoiceDottedName
    )

    if (isActionSelected) {
      const actionChoicesUpdated = { ...currentSimulation.actionChoices }
      delete actionChoicesUpdated[actionChoiceDottedName]

      updateCurrentSimulation({ actionChoices: actionChoicesUpdated })
    } else {
      updateCurrentSimulation({
        actionChoices: {
          ...currentSimulation.actionChoices,
          [actionChoiceDottedName]: true,
        },
      })
    }
  }

  const rejectAction = (actionChoiceDottedName: DottedName) => {
    if (!currentSimulation) return

    updateCurrentSimulation({
      actionChoices: {
        ...currentSimulation?.actionChoices,
        [actionChoiceDottedName]: false,
      },
    })
  }
  return { toggleActionChoice, rejectAction }
}
