import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export const simulationCategoryStarted = (category: DottedName) => [
  'trackEvent',
  'Simulation',
  'Category Started',
  `Category started ${category}`,
]

export const simulationCategoryCompleted = (category: DottedName) => [
  'trackEvent',
  'Simulation',
  'Category Completed',
  `Category completed ${category}`,
]

export const simulationSimulationFirstQuestionSeen = [
  'trackEvent',
  'Simulation',
  'Simulation First question seen',
]

export const simulationSimulationStarted = [
  'trackEvent',
  'Simulation',
  'Simulation First answer',
]

export const simulationSimulationCompleted = (bilan: number | null) => [
  'trackEvent',
  'Simulation',
  'Simulation Completed',
  null,
  String(Math.round((bilan ?? 0) / 100) / 10),
]

export const simulationSimulationTime = (time: number) => [
  'trackEvent',
  'Simulation',
  'Simulation Time',
  null,
  String(time),
]

export const gtmSimulationCompleted = {
  event: 'end-form',
}

export const gtmSimulationStarted = {
  event: 'start-form',
}
