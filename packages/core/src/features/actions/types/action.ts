import type { ISOSupportedLanguage } from '../../geo/types/language.js'
import type { ActionMedia } from './action-media.js'

/** An action one can take to improve their CO2 footprint */
export interface Action {
  id: string
  title: string
  language: ISOSupportedLanguage
  /**
   * Explanation of the action and its impact (Markdown)
   */
  longDescription: string
  theme: {
    id: string
    title: string
  }
  /** Publicodes rule. Using an id is more stable than the rule name */
  ruleId: string
  /** Visual content that illustrates the action such as ImpactCO2 widgets */
  media?: ActionMedia
  /**
   * Suggestions on how to implement the action in practice (Markdown)
   */
  means?: string
  /**
   * Financial benefits, aid or subsidies in order to implement the action (Markdown)
   */
  incentives?: string
  /** Additional resources (Markdown) */
  furtherReading?: string
}

/** Type for the raw data persisted in code files */
export type ActionFile = Omit<Action, 'theme'> & {
  themeId: string
}

interface ActionChoice {
  id: string
  userId: string
  actionId: string
  // TODO: update when product has decided possible choices
  type: 'committed' | 'rejected'
  chosenAt: Date
}

interface ActionAssessment {
  id: string
  simulationId: string
  actionId: string
  /** The impact of the action for the user, in kgCO2e */
  impact: number
  /** Whether the action is applicable for the user or not */
  applicable: boolean
}

export interface PersonalizedAction {
  userId: string
  action: Action
  choice: ActionChoice | null
  assessment: ActionAssessment
}
