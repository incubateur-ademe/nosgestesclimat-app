// Return tracking data in format
// [ 'trackEvent', 'Category', 'Action', 'Name', 'Value' ]

import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

// Figma comment #69
export const actionsClickYes = (action: DottedName) => [
  'trackEvent',
  'Actions',
  'Click Yes',
  `Click Yes ${action}`,
]

// Click on "Comprendre le calcul" link in action detail
export const actionsClickUnderstandCalculation = (action: DottedName) => [
  'trackEvent',
  'Actions',
  'Click Understand Calculation',
  `Click Understand Calculation ${action}`,
]
