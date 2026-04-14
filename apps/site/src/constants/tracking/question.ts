// Return tracking data in format
// [ 'trackEvent', 'Category', 'Action', 'Name', 'Value' ]

import type { DottedName, NodeValue } from '@incubateur-ademe/nosgestesclimat'

interface Props {
  question: DottedName
  answer?: NodeValue | string
  timeSpentOnQuestion?: number
}
// Figma comment #45
export const questionOpenInfo = ({ question }: Props) => [
  'trackEvent',
  'Simulateur',
  'Open Info',
  question,
]

// Figma comment #45
export const questionCloseInfo = ({ question }: Props) => [
  'trackEvent',
  'Simulateur',
  'Close Info',
  question,
]

// Figma comment #49
export const questionClickSuivant = ({
  question,
  timeSpentOnQuestion,
}: Props) => [
  'trackEvent',
  'Simulateur',
  'Click Suivant',
  question,
  String(timeSpentOnQuestion),
]

// Figma comment #49
export const questionClickPass = ({ question, timeSpentOnQuestion }: Props) => [
  'trackEvent',
  'Simulateur',
  'Click Je ne sais pas',
  question,
  String(timeSpentOnQuestion),
]

// Figma comment #48
export const questionClickPrevious = ({ question }: Props) => [
  'trackEvent',
  'Simulateur',
  'Click Précédent',
  question,
]

// Figma comment #46
export const questionChooseAnswer = ({ question, answer }: Props) => [
  'trackEvent',
  'Simulateur',
  'Choose Answer',
  question,
  String(answer),
]

// Figma comment #51
// An event is sent on every change of the input, it's too much !
// export const questionTypeAnswer = ({ question, answer }: Props) => [
//   'trackEvent',
//   'Simulateur',
//   'Type Answer',
//   question,
//   String(answer),
// ]

// Figma comment #50
export const questionClickSuggestion = ({ question, answer }: Props) => [
  'trackEvent',
  'Simulateur',
  'Click Suggestion',
  question,
  String(answer),
]

export const openSubQuestion = ({ question }: Props) => [
  'trackEvent',
  'Simulateur',
  'Open Sub Question',
  question,
]
