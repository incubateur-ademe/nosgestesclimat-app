import type { Prisma } from '../../../prisma/generated/client.ts'
import type {
  Action,
  ActionAssessment,
  NewAction,
  PersonalizedAction,
  UpdatedAction,
} from '../types/action.ts'
import type { Theme } from '../types/theme.ts'
import {
  mapSeoMetadata,
  mapSeoMetadataToPrismaCreate,
  mapSeoMetadataToPrismaUpsert,
} from './seo-metadata.mapper.ts'

interface DbActionWithRelations extends Prisma.ActionModel {
  seoMetadata: Prisma.SeoMetadataModel | null
}

export const mapAction = (
  dbAction: DbActionWithRelations,
  theme: Theme
): Action => ({
  id: dbAction.id,
  title: dbAction.title,
  slug: dbAction.slug,
  trackingId: dbAction.trackingId,
  language: 'fr',
  longDescription: dbAction.longDescription,
  theme: {
    id: theme.id,
    key: theme.key,
    slug: theme.slug,
    trackingId: theme.trackingId,
    title: theme.title,
    emoji: theme.emoji,
  },
  ruleId: dbAction.ruleId,
  media: dbAction.media
    ? (dbAction.media as unknown as Action['media'])
    : undefined,
  tips: dbAction.tips ?? undefined,
  financialIncentives: dbAction.financialIncentives ?? undefined,
  furtherExplore: dbAction.furtherExplore ?? undefined,
  metadata: mapSeoMetadata(dbAction.seoMetadata),
  publishedAt: dbAction.publishedAt,
  deletedAt: dbAction.deletedAt,
})

export const mapNewActionToPrisma = (
  action: NewAction
): Prisma.ActionCreateInput => ({
  title: action.title,
  slug: action.slug,
  trackingId: action.trackingId,
  longDescription: action.longDescription,
  ruleId: action.ruleId,
  themeId: action.themeId,
  media: action.media as Prisma.InputJsonValue | undefined,
  tips: action.tips,
  financialIncentives: action.financialIncentives,
  furtherExplore: action.furtherExplore,
  publishedAt: action.publishedAt,
  deletedAt: action.deletedAt,
  seoMetadata: mapSeoMetadataToPrismaCreate(action.metadata),
})

export const mapUpdatedActionToPrisma = (
  data: UpdatedAction
): Prisma.ActionUpdateInput => ({
  title: data.title,
  slug: data.slug,
  trackingId: data.trackingId,
  longDescription: data.longDescription,
  ruleId: data.ruleId,
  themeId: data.themeId,
  media: data.media as unknown as Prisma.InputJsonValue,
  tips: data.tips,
  financialIncentives: data.financialIncentives,
  furtherExplore: data.furtherExplore,
  publishedAt: data.publishedAt,
  deletedAt: data.deletedAt,
  seoMetadata: data.metadata
    ? mapSeoMetadataToPrismaUpsert(data.metadata)
    : undefined,
})

export const mapPersonalizedAction = (
  action: Action,
  assessment: Prisma.ActionAssessmentModel | null
): PersonalizedAction => ({
  ...action,
  assessment: assessment ? mapAssessment(assessment) : null,
  choice: null, // TODO: map choice when the feature will be implemented
})

const mapAssessment = (
  dbAssessment: Prisma.ActionAssessmentModel
): ActionAssessment => {
  const base = {
    id: dbAssessment.id,
    simulationId: dbAssessment.simulationId,
    actionId: dbAssessment.actionId,
    createdAt: dbAssessment.createdAt,
  }
  if (dbAssessment.applicable === true) {
    return {
      ...base,
      applicable: true,
      impact: dbAssessment.impact ?? undefined,
    }
  }
  return {
    ...base,
    applicable: dbAssessment.applicable ?? undefined,
    impact: undefined,
  }
}
