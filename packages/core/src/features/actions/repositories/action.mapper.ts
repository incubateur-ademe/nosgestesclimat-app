import type { Prisma } from '../../../prisma/generated/client.ts'
import type { ISOSupportedLanguage } from '../../geo/types/language.ts'
import type {
  Action,
  ActionAssessment,
  NewAction,
  PersonalizedAction,
  UpdatedAction,
} from '../types/action.ts'
import type { ThemeRow } from '../types/theme.ts'
import {
  mapActionTranslationsToPrismaCreate,
  mapActionTranslationsToPrismaUpdate,
} from './action-translation.mapper.ts'
import { mapSeoMetadata } from './seo-metadata.mapper.ts'

interface DbActionIdentity {
  id: string
  trackingId: string
  ruleId: string
  publishedAt: Date | null
  deletedAt: Date | null
}

interface DbActionTranslationWithSeoMetadata
  extends Prisma.ActionTranslationModel {
  seoMetadata: Prisma.SeoMetadataModel | null
}

export const mapAction = (
  dbAction: DbActionIdentity,
  translation: DbActionTranslationWithSeoMetadata,
  theme: ThemeRow
): Action => ({
  id: dbAction.id,
  title: translation.title,
  slug: translation.slug,
  trackingId: dbAction.trackingId,
  language: translation.locale as ISOSupportedLanguage,
  longDescription: translation.longDescription,
  theme: {
    id: theme.id,
    key: theme.key,
    slug: translation.locale === 'en' ? theme.slugEn : theme.slug,
    trackingId: theme.trackingId,
    title: translation.locale === 'en' ? theme.titleEn : theme.title,
    emoji: theme.emoji,
  },
  ruleId: dbAction.ruleId,
  media: translation.media
    ? (translation.media as unknown as Action['media'])
    : undefined,
  tips: translation.tips ?? undefined,
  financialIncentives: translation.financialIncentives ?? undefined,
  furtherExplore: translation.furtherExplore ?? undefined,
  metadata: mapSeoMetadata(translation.seoMetadata),
  publishedAt: dbAction.publishedAt,
  deletedAt: dbAction.deletedAt,
})

export const mapNewActionToPrisma = (
  action: NewAction
): Prisma.ActionCreateInput => ({
  trackingId: action.trackingId,
  ruleId: action.ruleId,
  themeId: action.themeId,
  publishedAt: action.publishedAt,
  deletedAt: action.deletedAt,
  translations: mapActionTranslationsToPrismaCreate(action.translations),
})

export const mapUpdatedActionToPrisma = (
  id: string,
  data: UpdatedAction
): Prisma.ActionUpdateInput => ({
  trackingId: data.trackingId,
  ruleId: data.ruleId,
  themeId: data.themeId,
  publishedAt: data.publishedAt,
  deletedAt: data.deletedAt,
  translations: mapActionTranslationsToPrismaUpdate(id, data.translations),
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
