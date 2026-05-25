import type { ActionModel } from '../../../prisma/generated/models/Action.ts'
import type { SeoMetadataModel } from '../../../prisma/generated/models/SeoMetadata.ts'
import type { Action } from '../types/action.ts'
import type { Theme } from '../types/theme.ts'
import { mapSeoMetadata } from './seo-metadata.mapper.ts'

export interface DbActionWithRelations extends ActionModel {
  seoMetadata: SeoMetadataModel | null
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
