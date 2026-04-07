// Return tracking data in format
// [ 'trackEvent', 'Category', 'Action', 'Name', 'Value' ]
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

// Figma comment #60
export const endClickCategory = (category: DottedName) => [
  'trackEvent',
  'Fin',
  'Click Category',
  `Click Category ${category}`,
]

// Figma comment #63
export const endClickAction = (action: DottedName) => [
  'trackEvent',
  'Fin',
  'Click Action',
  `Click Action ${action}`,
]

// Figma comment #64
export const endClickActions = ['trackEvent', 'Fin', 'Click Actions']

export const endClickDocumentationServer = 'Fin|Click Documentation'

export const captureEndClickDocumentationServer = JSON.stringify({
  eventName: 'click documentation',
})
