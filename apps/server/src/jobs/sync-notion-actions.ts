import {
  food,
  housing,
  misc,
  societalServices,
  transport,
} from '@nosgestesclimat/core/features/actions/data/themes/index'
import { parseImpactCO2Script } from '@nosgestesclimat/core/features/actions/helpers/parse-impact-co2-script'
import {
  createManyActions,
  deleteManyActions,
  findAllActions,
  updateAction,
} from '@nosgestesclimat/core/features/actions/repositories/actions.repository'
import { findThemes } from '@nosgestesclimat/core/features/actions/repositories/themes.repository'
import type {
  Action,
  ActionTranslationInput,
  NewAction,
  UpdatedAction,
} from '@nosgestesclimat/core/features/actions/types/action'
import type { ActionMedia } from '@nosgestesclimat/core/features/actions/types/action-media'
import type { SeoMetadata } from '@nosgestesclimat/core/features/actions/types/seo-metadata'
import type { Theme } from '@nosgestesclimat/core/features/actions/types/theme'
import { trackingIdSchema } from '@nosgestesclimat/core/features/tracking/schema'
import { Client, isFullPage } from '@notionhq/client'
import type { BaseIssue, InferOutput } from 'valibot'
import * as v from 'valibot'
import { config } from '../config.ts'
import logger from '../logger.ts'
import { convertNotionRichTextToMd } from './helpers/convert-notion-rich-text-to-md.ts'

const trimmedString = v.pipe(v.string(), v.trim())
const trimmedLowercaseString = v.pipe(trimmedString, v.toLowerCase())

const nullishTrimmedString = v.pipe(
  v.nullish(trimmedString),
  v.transform((s) => {
    if (s === '') return null
    return s
  })
)

const nullishString = <
  TOutput,
  TSchema extends v.GenericSchema<string, TOutput>,
>(
  inner: TSchema
) => {
  return v.pipe(
    v.nullish(trimmedString),
    v.transform((s) => (s === '' ? null : s)),
    v.nullish(inner)
  )
}

const themeNotionOptionSchema = v.picklist([
  'Alimentation',
  'Transport',
  'Services sociétaux',
  'Logement',
  'Divers',
])

type ThemeNotionOption = InferOutput<typeof themeNotionOptionSchema>

const themeIdByNotionOption = {
  Alimentation: food.id,
  Transport: transport.id,
  'Services sociétaux': societalServices.id,
  Logement: housing.id,
  Divers: misc.id,
} as const satisfies Record<ThemeNotionOption, string>

const MediaNotionRowSchema = v.pipe(
  v.string(),
  v.rawTransform((ctx) => {
    const result = parseMedia(ctx.dataset.value)
    if (!result.success) {
      ctx.addIssue({
        message: `Invalid media: ${result.error}`,
      })
      return ctx.NEVER
    }
    return result.data
  })
)

export const NotionActionRowSchema = v.pipe(
  v.object({
    ID: v.union([v.number(), v.pipe(v.string(), v.toNumber())]),
    theme: v.pipe(
      themeNotionOptionSchema,
      v.transform((value) => themeIdByNotionOption[value]),
      v.uuid()
    ),
    published_at: nullishString(v.pipe(v.string(), v.toDate())),
    rule_id: v.pipe(trimmedLowercaseString, v.uuid()),
    slug: v.pipe(trimmedLowercaseString, v.slug()),
    tracking_id: v.pipe(trimmedLowercaseString, trackingIdSchema),
    front_title_fr: trimmedString,
    long_description_fr: trimmedString,
    media_fr: nullishString(MediaNotionRowSchema),
    media_title_fr: nullishTrimmedString,
    tips_fr: nullishTrimmedString,
    financial_incentives_fr: nullishTrimmedString,
    further_explore_fr: nullishTrimmedString,
    seo_title_fr: nullishTrimmedString,
    seo_description_fr: nullishTrimmedString,
    seo_json_ld: nullishString(v.pipe(v.string(), v.parseJson())),
    front_title_en: nullishTrimmedString,
    slug_en: nullishString(v.pipe(trimmedLowercaseString, v.slug())),
    long_description_en: nullishTrimmedString,
    media_en: nullishString(MediaNotionRowSchema),
    media_title_en: nullishTrimmedString,
    tips_en: nullishTrimmedString,
    financial_incentives_en: nullishTrimmedString,
    further_explore_en: nullishTrimmedString,
    seo_title_en: nullishTrimmedString,
    seo_description_en: nullishTrimmedString,
    seo_json_ld_en: nullishString(v.pipe(v.string(), v.parseJson())),
  })
)

type NotionActionRow = InferOutput<typeof NotionActionRowSchema>

export interface NotionRawRow {
  ID?: string | number
  theme?: string | null
  published_at?: string | null
  rule_id?: string | null
  slug?: string | null
  tracking_id?: string | null
  front_title_fr?: string | null
  long_description_fr?: string | null
  media_fr?: string | null
  media_title_fr?: string | null
  tips_fr?: string | null
  financial_incentives_fr?: string | null
  further_explore_fr?: string | null
  seo_title_fr?: string | null
  seo_description_fr?: string | null
  seo_json_ld?: string | null
  front_title_en?: string | null
  slug_en?: string | null
  long_description_en?: string | null
  media_en?: string | null
  media_title_en?: string | null
  tips_en?: string | null
  financial_incentives_en?: string | null
  further_explore_en?: string | null
  seo_title_en?: string | null
  seo_description_en?: string | null
  seo_json_ld_en?: string | null
  [key: string]: unknown
}

export async function syncNotionActions({
  fetchAllPages,
  actionDatabaseId,
}: {
  fetchAllPages: FetchAllPages
  actionDatabaseId: string
}): Promise<void> {
  logger.info('Starting Notion actions sync...')

  logger.info(
    `Fetching all rows from Notion action database "${actionDatabaseId}"`
  )

  const [rows, themes, existingDbActions] = await Promise.all([
    fetchAllPages(actionDatabaseId),
    findThemes(),
    findAllActions('fr'),
  ])

  logger.info(`Fetched ${rows.length} rows from Notion action database`)

  if (rows.length === 0) {
    logger.warn(
      'Notion database returned 0 rows, skipping sync to protect production data'
    )
    return
  }

  logger.info(
    `Found ${existingDbActions.length} existing actions from database`
  )

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
  toCreate.forEach((action) => {
    logger.info(`Created action "${action.translations.fr.slug}"`)
  })
  toDelete.forEach((id) => {
    logger.info(`Deleted action with id "${id}"`)
  })
  invalidRows.forEach(({ row, reason, issues }) => {
    logger.warn(`Row "${row.slug}" failed validation and was ignored`, {
      row,
      reason,
      issues: issues,
    })
  })
  logger.info(
    `Summary: ${rows.length} total, ${toCreate.length} created, ${toUpdate.length} updated, ${toDelete.length} deleted, ${invalidRows.length} invalid rows`
  )
}

function validateNotionRows(themes: Theme[], rows: NotionRawRow[]) {
  const validThemeIds = new Set(themes.map((t) => t.id))

  // Validate rows and filter out invalid ones
  const validRows: NotionActionRow[] = []
  const invalidRows: {
    row: NotionRawRow
    reason: 'schema_validation' | 'invalid_theme'
    issues?: BaseIssue<unknown>[]
  }[] = []
  for (const row of rows) {
    const result = v.safeParse(NotionActionRowSchema, row)
    if (!result.success) {
      invalidRows.push({
        row,
        reason: 'schema_validation',
        issues: result.issues,
      })
      continue
    }
    if (!validThemeIds.has(result.output.theme)) {
      invalidRows.push({ row, reason: 'invalid_theme' })
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
  const existingActionsBySlug: Record<string, Action> =
    existingDbActions.reduce(
      (acc, action) => {
        acc[action.slug] = action
        return acc
      },
      {} as Record<string, Action>
    )

  const toCreate: NewAction[] = []
  const toUpdate: { id: string; data: UpdatedAction }[] = []
  const toDelete: string[] = []

  const duplicatedEnglishSlugs = findDuplicatedEnglishSlugs(validRows)

  for (const row of validRows) {
    const action = mapNotionRowToAction(row, duplicatedEnglishSlugs)
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
      if (!isFullPage(page)) {
        logger.warn('Skipping page without properties', { pageId: page.id })
        continue
      }

      const properties = page.properties
      const row: NotionRawRow = {}

      for (const [key, property] of Object.entries(properties)) {
        const value = getPropertyValue(property)
        row[key as keyof NotionRawRow] = value
      }

      rows.push(row)
    }

    if (response.has_more && response.next_cursor) {
      const nextRows = await fetchAllPages(databaseId, response.next_cursor)
      rows.push(...nextRows)
    }

    return rows
  }

type NotionDatabaseResult = Awaited<
  ReturnType<Client['databases']['query']>
>['results'][number]
type PageObjectResponse = Extract<
  NotionDatabaseResult,
  { object: 'page'; properties: unknown }
>
type NotionProperty = PageObjectResponse['properties'][string]

function getPropertyValue(
  property: NotionProperty
): string | boolean | number | undefined | null {
  const propertyType = property.type
  switch (propertyType) {
    case 'rich_text':
      return convertNotionRichTextToMd(property.rich_text)
    case 'title':
      return convertNotionRichTextToMd(property.title)
    case 'url':
      return property.url ?? null
    case 'date':
      return property.date?.start ?? null
    case 'relation':
      return property.relation?.[0]?.id
    case 'select':
      return property.select?.name ?? null
    case 'number':
      return property.number ?? null
    case 'email':
      return property.email ?? null
    case 'phone_number':
      return property.phone_number ?? null
    case 'checkbox':
      return property.checkbox
    case 'unique_id':
      return property.unique_id?.number ?? null
    case 'multi_select':
    case 'status':
    case 'files':
    case 'created_by':
    case 'created_time':
    case 'last_edited_by':
    case 'last_edited_time':
    case 'formula':
    case 'button':
    case 'verification':
    case 'people':
    case 'rollup':
      logger.warn('Unsupported Notion property type', { type: propertyType })
      return undefined
    default:
      propertyType satisfies never
      logger.warn('Unknown Notion property type', { type: propertyType })
      return undefined
  }
}

function parseMedia(
  media: string
): { success: true; data: ActionMedia } | { success: false; error: string } {
  const result = parseImpactCO2Script(media)

  if (!result.success) {
    return { success: false, error: result.error }
  }

  const { type, searchParams } = result.data

  // Build options from remaining search params
  const options = Object.fromEntries(searchParams)

  // Let UI control display
  delete options.language
  delete options.theme
  delete options.hideButtons

  return {
    success: true,
    data: {
      type: 'impact_co2',
      title: '', // add it later for simplicity
      data: {
        type,
        options: Object.keys(options).length > 0 ? options : undefined,
      },
    },
  }
}

/**
 * The `[locale, slug]` unique constraint on ActionTranslation would make the
 * sync fail if two Notion rows shared the same `slug_en`. Detect them upfront
 * so the affected rows can be treated as untranslated instead.
 */
function findDuplicatedEnglishSlugs(rows: NotionActionRow[]): Set<string> {
  const seen = new Set<string>()
  const duplicated = new Set<string>()

  for (const row of rows) {
    if (!row.slug_en) continue
    if (seen.has(row.slug_en)) {
      duplicated.add(row.slug_en)
    } else {
      seen.add(row.slug_en)
    }
  }

  return duplicated
}

/**
 * When:
 * 1. all required fields are present, return the english translation
 * 2. some required fields are missing, return `undefined` to keep previous translation untouched
 * 3. all required fields are missing, return `null` to remove previous translation
 * 4. some slug is duplicated, return `undefined` to keep everything untouched and fix it manually
 */
function extractEnglishTranslation(
  row: NotionActionRow,
  duplicatedEnglishSlugs: Set<string>
): ActionTranslationInput | null | undefined {
  const title = row.front_title_en
  const slug = row.slug_en
  const longDescription = row.long_description_en

  if (!title && !slug && !longDescription) {
    return null
  }

  if (slug && duplicatedEnglishSlugs.has(slug)) {
    logger.warn(
      `Row "${row.slug}" shares its English slug "${slug}" with another row and will be treated as untranslated`,
      { slug: row.slug, slugEn: slug }
    )
    return undefined
  }

  if (!title || !slug || !longDescription) {
    logger.warn(
      `Row "${row.slug}" has a partial English translation and will be treated as untranslated`,
      {
        slug: row.slug,
        missing: [
          ['front_title_en', title],
          ['slug_en', slug],
          ['long_description_en', longDescription],
        ]
          .filter(([_, v]) => !!v)
          .map(([k]) => k)
          .join(', '),
      }
    )
    return undefined
  }

  const media = row.media_en

  if (media && row.media_title_en) {
    media.title = row.media_title_en
  }

  return {
    title,
    slug,
    longDescription,
    media,
    tips: row.tips_en,
    financialIncentives: row.financial_incentives_en,
    furtherExplore: row.further_explore_en,
    metadata: {
      title: row.seo_title_en,
      description: row.seo_description_en,
      jsonLd: row.seo_json_ld_en as SeoMetadata['jsonLd'],
    },
  }
}

function mapNotionRowToAction(
  row: NotionActionRow,
  duplicatedEnglishSlugs: Set<string>
): NewAction {
  const media = row.media_fr

  if (media && row.media_title_fr) {
    media.title = row.media_title_fr
  }

  return {
    trackingId: row.tracking_id,
    ruleId: row.rule_id,
    themeId: row.theme,
    publishedAt: row.published_at ?? null,
    deletedAt: null, // Actions from Notion are active
    translations: {
      fr: {
        title: row.front_title_fr,
        slug: row.slug,
        longDescription: row.long_description_fr,
        media,
        tips: row.tips_fr,
        financialIncentives: row.financial_incentives_fr,
        furtherExplore: row.further_explore_fr,
        metadata: {
          title: row.seo_title_fr,
          description: row.seo_description_fr,
          jsonLd: row.seo_json_ld as SeoMetadata['jsonLd'],
        },
      },
      en: extractEnglishTranslation(row, duplicatedEnglishSlugs),
    },
  }
}

// Only run when executed directly, not when imported (required for the tests)
const isMain =
  process.argv[1] && import.meta.url === `file://${process.argv[1]}`

if (isMain) {
  const { apiKey, actionDatabaseId } = config.thirdParty.notion
  if (!apiKey || !actionDatabaseId) {
    logger.error('Notion API key or action database ID not configured')
    process.exit(1)
  }
  const client = new Client({ auth: apiKey })
  const fetchAllPages = createFetchAllPages(client)
  syncNotionActions({ fetchAllPages, actionDatabaseId })
    .then(() => process.exit(0))
    .catch((e) => {
      logger.error(e instanceof Error ? e.message : String(e), { error: e })
      process.exit(1)
    })
}
