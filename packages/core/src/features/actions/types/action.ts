import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type { ActionMedia } from './action-media.ts'
import type { SeoMetadata } from './seo-metadata.ts'
import type { Theme } from './theme.ts'

/** An action one can take to improve their CO2 footprint */
export interface Action {
  id: string
  title: string
  slug: string
  trackingId: string
  language: ISOSupportedLanguage
  /**
   * Explanation of the action and its impact (Markdown)
   */
  longDescription: string
  theme: Pick<Theme, 'id' | 'key' | 'slug' | 'trackingId' | 'title' | 'emoji'>
  /** Publicodes rule. Using an id is more stable than the rule name */
  ruleId: string
  /** Visual content that illustrates the action such as ImpactCO2 widgets */
  media?: ActionMedia
  /**
   * Suggestions on how to implement the action in practice (Markdown)
   */
  tips?: string
  /**
   * Financial benefits, aid or subsidies in order to implement the action (Markdown)
   */
  financialIncentives?: string
  /** Additional resources (Markdown) */
  furtherExplore?: string
  /** Metadata for SEO */
  metadata: SeoMetadata
  publishedAt: Date | null
  deletedAt: Date | null
}

export interface NewAction {
  title: string
  slug: string
  trackingId: string
  longDescription: string
  ruleId: string
  themeId: string
  media?: ActionMedia | null
  tips?: string | null
  financialIncentives?: string | null
  furtherExplore?: string | null
  metadata?: SeoMetadata | null
  publishedAt?: Date | null
  deletedAt?: Date | null
}

export type UpdatedAction = Partial<NewAction>

export interface ActionChoice {
  id: string
  userId: string
  actionId: string
  // TODO: update when product has decided possible choices
  type: 'committed' | 'rejected'
  chosenAt: Date
}

export type NewActionAssessment = {
  simulationId: string
  actionId: string
} & (
  | // Case 1. The action is applicable and the impact is either a number or not evaluable
  {
      applicable: true
      impact: number | undefined
    }
  // Case 2. The action is not applicable
  | {
      applicable: false
      impact: undefined
    }
  // Case 3. Missing data to assess the action
  | {
      applicable: undefined
      impact: undefined
    }
)

export type ActionAssessment = NewActionAssessment & {
  id: string
  createdAt: Date
}

export interface PersonalizedAction extends Action {
  choice: ActionChoice | null
  assessment: ActionAssessment | null
}
