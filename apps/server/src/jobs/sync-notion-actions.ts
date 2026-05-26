import {
  createManyActions,
  deleteManyActions,
  findAllActions,
  updateAction,
} from '@nosgestesclimat/core/features/actions/repositories/actions.repository'
import { findThemes } from '@nosgestesclimat/core/features/actions/repositories/themes.repository'
import type {
  Action,
  NewAction,
  UpdatedAction,
} from '@nosgestesclimat/core/features/actions/types/action'
import type { SeoMetadata } from '@nosgestesclimat/core/features/actions/types/seo-metadata'
import type { Theme } from '@nosgestesclimat/core/features/actions/types/theme'
import { Client, isFullDatabase } from '@notionhq/client'
import type { BaseIssue, InferOutput } from 'valibot'
import {
  custom,
  object,
  optional,
  parseJson,
  pipe,
  regex,
  safeParse,
  string,
  toDate,
  toLowerCase,
  toNumber,
  transform,
  trim,
  uuid,
} from 'valibot'
import { config } from '../config.ts'
import logger from '../logger.ts'

const trimmedString = pipe(string(), trim())
const trimmedLowercaseString = pipe(trimmedString, toLowerCase())

const NotionActionRowSchema = pipe(
  object({
    ID: pipe(string(), toNumber()),
    theme_id: pipe(string(), uuid()),
    published_at: optional(pipe(string(), toDate())),
    rule_id: pipe(trimmedString, uuid()),
    slug: pipe(
      trimmedLowercaseString,
      regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Invalid slug format')
    ),
    tracking_id: pipe(
      trimmedLowercaseString,
      regex(/^[a-z0-9]+(_[a-z0-9]+)*$/, 'Invalid tracking id format')
    ),
    front_title_fr: trimmedString,
    long_description_fr: trimmedString, // TODO: convert to md
    media_fr: optional(
      pipe(
        trimmedString,
        transform((str) => (str ? str : undefined))
      )
    ),
    media_title_fr: optional(trimmedString),
    tips_fr: optional(trimmedString), // TODO: convert to md
    financial_incentives_fr: optional(trimmedString), // TODO: convert to md
    further_explore_fr: optional(trimmedString), // TODO: convert to md
    seo_title_fr: optional(trimmedString),
    seo_description_fr: optional(trimmedString),
    seo_json_ld: optional(pipe(string(), parseJson())),
  }),
  custom((input) => {
    const data = input as Record<string, unknown>
    if (
      (data.media_fr && !data.media_title_fr) ||
      (!data.media_fr && data.media_title_fr)
    ) {
      throw new Error(
        'media_title_fr is required when media_fr is provided, and vice versa'
      )
    }
    return true
  })
)

type NotionActionRow = InferOutput<typeof NotionActionRowSchema>

type NotionRawRow = Record<string, string | boolean | undefined>

export async function syncNotionActions({
  fetchAllPages,
}: {
  fetchAllPages: FetchAllPages
}) {
  try {
    logger.info('Starting Notion actions sync...')

    const { actionDatabaseId } = config.thirdParty.notion

    if (!actionDatabaseId) {
      logger.error('Notion action database ID not configured')
      process.exit(1)
    }

    logger.info(
      `Fetching all rows from Notion action database: ${actionDatabaseId}`
    )

    const rows = await fetchAllPages(actionDatabaseId)

    logger.info(`Fetched ${rows.length} rows from Notion action database`)

    const [themes, existingDbActions] = await Promise.all([
      findThemes(),
      findAllActions(),
    ])

    const { validRows, invalidRows } = validateNotionRows(themes, rows)
    const { toCreate, toUpdate, toDelete } = categorizeNotionRows(
      rows,
      validRows,
      existingDbActions
    )

    // Create new actions
    if (toCreate.length > 0) {
      logger.info(`Creating ${toCreate.length} actions`)
      await createManyActions(toCreate)
      logger.info(`Created ${toCreate.length} actions`)
    }

    // Update actions
    for (const { id, data } of toUpdate) {
      logger.info(`Updating action "${id}"`)
      await updateAction(id, data)
    }
    logger.info(`Updated ${toUpdate.length} actions`)

    // Soft delete actions
    if (toDelete.length > 0) {
      logger.info(`Soft deleting ${toDelete.length} actions`)
      await deleteManyActions(toDelete)
      logger.info(`Soft deleted ${toDelete.length} actions`)
    }

    logger.info('Notion actions sync completed successfully')
    logger.info(
      `Summary: ${toCreate.length} created, ${toUpdate.length} updated, ${toDelete.length} deleted, ${invalidRows.length} invalid rows`
    )
    toCreate.forEach((action) => {
      logger.info(`Created action "${action.slug}"`, { action })
    })
    toDelete.forEach((id) => {
      logger.info(`Deleted action with id "${id}"`, { id })
    })
    invalidRows.forEach(({ row, reason, issues }) => {
      logger.warn(`Row "${row.slug}" failed validation and was ignored`, {
        row,
        reason,
        issues: issues,
      })
    })
    process.exit(0)
  } catch (e) {
    logger.error('Error syncing Notion actions', { error: e })
    process.exit(1)
  }
}

function validateNotionRows(themes: Theme[], rows: NotionRawRow[]) {
  const validThemeIds = new Set(themes.map((t) => t.id))

  // Validate rows and filter out invalid ones
  const validRows: NotionActionRow[] = []
  const invalidRows: {
    row: NotionRawRow
    reason: 'schema_validation' | 'invalid_theme_id'
    issues?: BaseIssue<unknown>[]
  }[] = []
  for (const row of rows) {
    const result = safeParse(NotionActionRowSchema, row)
    if (!result.success) {
      invalidRows.push({
        row,
        reason: 'schema_validation',
        issues: result.issues,
      })
      continue
    }
    if (!validThemeIds.has(result.output.theme_id)) {
      invalidRows.push({ row, reason: 'invalid_theme_id' })
      continue
    }
    validRows.push(result.output)
  }

  return { validRows, invalidRows }
}

function categorizeNotionRows(
  allRows: NotionRawRow[],
  validRows: NotionActionRow[],
  existingDbActions: Action[]
) {
  const allNotionActionSlugs = new Set(allRows.map((r) => r.slug))
  // Map existing actions by slug for easy lookup
  const existingActionsBySlug: Record<string, Action> = {}
  for (const action of existingDbActions) {
    existingActionsBySlug[action.slug] = action
  }

  const toCreate: NewAction[] = []
  const toUpdate: { id: string; data: UpdatedAction }[] = []
  const toDelete: string[] = []

  for (const row of validRows) {
    const action = mapNotionRowToAction(row)
    const existing = existingActionsBySlug[row.slug]

    if (existing) {
      toUpdate.push({ id: existing.id, data: action })
    } else {
      toCreate.push(action)
    }
  }

  for (const action of existingDbActions) {
    // Check non validated actions to avoid deleting actions that failed validation
    if (!allNotionActionSlugs.has(action.slug)) {
      toDelete.push(action.id)
    }
  }

  return { toCreate, toUpdate, toDelete }
}

type FetchAllPages = (
  databaseId: string,
  startCursor?: string
) => Promise<NotionRawRow[]>

const createFetchAllPages = (client: Client): FetchAllPages =>
  async function fetchAllPages(
    databaseId: string,
    startCursor?: string
  ): Promise<NotionRawRow[]> {
    const response = await client.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
      page_size: 100,
    })

    const rows: NotionRawRow[] = []

    for (const page of response.results) {
      if (!isFullDatabase(page)) {
        logger.warn('Skipping page without properties', { pageId: page.id })
        continue
      }

      const properties = page.properties
      const row: NotionRawRow = {}

      for (const [key, property] of Object.entries(properties)) {
        const value = getPropertyValue(property)
        row[key] = value
      }

      rows.push(row)
    }

    if (response.has_more && response.next_cursor) {
      const nextRows = await fetchAllPages(databaseId, response.next_cursor)
      rows.push(...nextRows)
    }

    return rows
  }

// TODO: find real data structure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPropertyValue(property: any): string | boolean | undefined {
  switch (property?.type) {
    case 'rich_text':
      return property.rich_text?.[0]?.plain_text || ''
    case 'title':
      return property.title?.[0]?.plain_text || ''
    case 'url':
      return property.url || ''
    case 'date':
      return property.date?.start || ''
    case 'relation':
      return property.relation?.[0]?.id || ''
    case 'select':
      return property.select?.name || ''
    case 'number':
      return property.number?.toString() || ''
    case 'email':
      return property.email || ''
    case 'phone_number':
      return property.phone_number || ''
    case 'checkbox':
      return property.checkbox
    default:
      logger.warn('Unsupported Notion property type', { type: property?.type })
      return undefined
  }
}

function mapNotionRowToAction(row: NotionActionRow): NewAction {
  const media =
    row.media_fr && row.media_title_fr
      ? {
          type: 'image' as const,
          title: row.media_title_fr,
          src: row.media_fr,
          alt: row.media_title_fr,
        }
      : undefined

  const metadata: SeoMetadata = {
    title: row.seo_title_fr,
    description: row.seo_description_fr,
    jsonLd: row.seo_json_ld as SeoMetadata['jsonLd'],
  }

  return {
    title: row.front_title_fr,
    slug: row.slug,
    trackingId: row.tracking_id,
    longDescription: row.long_description_fr,
    ruleId: row.rule_id,
    themeId: row.theme_id,
    media,
    tips: row.tips_fr,
    financialIncentives: row.financial_incentives_fr,
    furtherExplore: row.further_explore_fr,
    metadata,
    publishedAt: row.published_at ?? null,
    deletedAt: null, // Actions from Notion are active
  }
}

// Only run when executed directly, not when imported (required for the tests)
const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`

if (isMain) {
  const { apiKey } = config.thirdParty.notion
  if (!apiKey) {
    logger.error('Notion API key not configured')
    process.exit(1)
  }
  const client = new Client({ auth: apiKey })
  const fetchAllPages = createFetchAllPages(client)
  syncNotionActions({ fetchAllPages })
}
