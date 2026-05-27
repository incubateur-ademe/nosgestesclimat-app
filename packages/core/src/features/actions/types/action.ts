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
  theme: Pick<Theme, 'id' | 'key' | 'trackingId' | 'title' | 'emoji'>
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
  media?: ActionMedia
  tips?: string
  financialIncentives?: string
  furtherExplore?: string
  metadata?: SeoMetadata
  publishedAt?: Date | null
  deletedAt?: Date | null
}

export interface UpdatedAction {
  title?: string
  slug?: string
  trackingId?: string
  longDescription?: string
  themeId?: string
  ruleId?: string
  media?: ActionMedia
  tips?: string | null
  financialIncentives?: string | null
  furtherExplore?: string | null
  metadata?: SeoMetadata
  publishedAt?: Date | null
  deletedAt?: Date | null
}

interface ActionChoice {
  id: string
  userId: string
  actionId: string
  // TODO: update when product has decided possible choices
  type: 'committed' | 'rejected'
  chosenAt: Date
}

type ActionAssessment = {
  id: string
  simulationId: string
  actionId: string
} & (
  | {
      /** The impact of the action for the user, in kgCO2e */
      impact: number
      /** Whether the action is applicable for the user or not */
      applicable: true
    }
  | {
      impact: undefined
      applicable: false | undefined
    }
)

export interface PersonalizedAction {
  userId: string
  action: Action
  choice: ActionChoice | null
  assessment: ActionAssessment
}
