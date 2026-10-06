import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'

export type ActionFrom = 'fin' | 'mon-espace' | 'index'

export interface ActionCatalogueContext {
  totalFootprint: number | null | undefined
  assessmentStatus: AssessmentStatus | null | undefined
}
