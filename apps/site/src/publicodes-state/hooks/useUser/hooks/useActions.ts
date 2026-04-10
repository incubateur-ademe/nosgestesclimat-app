import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { Simulation, UpdateCurrentSimulationProps } from '../../../types'

interface Props {
  currentSimulation: Simulation
  updateCurrentSimulation: (simulation: UpdateCurrentSimulationProps) => void
}
export default function useActions({
  currentSimulation,
  updateCurrentSimulation,
}: Props) {
  const toggleActionChoice = (actionChoiceDottedName: DottedName) => {
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
    updateCurrentSimulation({
      actionChoices: {
        ...currentSimulation?.actionChoices,
        [actionChoiceDottedName]: false,
      },
    })
  }
  return { toggleActionChoice, rejectAction }
}
