import { faker } from '@faker-js/faker'
import { actionFactory } from '@nosgestesclimat/core/features/actions/factories/action.factory'
import { findAllActions } from '@nosgestesclimat/core/features/actions/repositories/actions.repository'
import { findThemes } from '@nosgestesclimat/core/features/actions/repositories/themes.repository'
import type { Action } from '@nosgestesclimat/core/features/actions/types/action'
import { prisma } from '@nosgestesclimat/core/prisma/client'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import logger from '../../logger.ts'
import { syncNotionActions, type NotionRawRow } from '../sync-notion-actions.ts'

let validTheme: Action['theme']

const actionDatabaseId = faker.string.uuid()

beforeAll(async () => {
  const themes = await findThemes()
  const theme = themes.find((t) => t.key === 'food')!
  const { id, key, slug, trackingId, title, emoji } = theme
  validTheme = { id, key, slug, trackingId, title, emoji }
})

describe('syncNotionActions', () => {
  afterEach(async () => {
    await prisma.action.deleteMany({})
  })

  it('creates new actions from valid Notion rows', async () => {
    const row1 = buildNotionRow()
    const row2 = buildNotionRow()
    const fetchAllPages = vi.fn().mockResolvedValue([row1, row2])

    await syncNotionActions({ fetchAllPages, actionDatabaseId })

    const actions = await findAllActions('fr')
    expect(sorted(actions)).toEqual(
      sorted([row1, row2]).map((row) => {
        return {
          id: expect.any(String),
          title: row.front_title_fr,
          slug: row.slug,
          trackingId: row.tracking_id,
          language: 'fr',
          longDescription: row.long_description_fr,
          theme: validTheme,
          ruleId: row.rule_id,
          metadata: {},
          publishedAt: null,
          deletedAt: null,
        } satisfies Action
      })
    )
  })

  it('updates existing actions matched by slug', async () => {
    const existing = await actionFactory.create({
      slug: 'my-slug',
    })
    const row = buildNotionRow({
      slug: 'my-slug',
      tracking_id: 'updated_tracking_id',
      rule_id: faker.string.uuid(),
      front_title_fr: 'Updated Title',
      long_description_fr: 'Updated long description',
      media_fr:
        '<script data-name="impact-co2" src="https://impactco2.fr/iframe.js" data-type="transport" data-search="?theme=default&language=fr&km=10"></script>',
      media_title_fr: 'updated media_title_fr',
      tips_fr: 'updated tips_fr',
      financial_incentives_fr: 'updated financial_incentives_fr',
      further_explore_fr: 'updated further_explore_fr',
      seo_title_fr: 'updated seo_title_fr',
      seo_description_fr: 'updated seo_description_fr',
      seo_json_ld: '{"@context": "https://schema.org","@graph": []}',
      published_at: new Date('2025-01-15').toISOString(),
    })
    const fetchAllPages = vi.fn().mockResolvedValue([row])

    await syncNotionActions({ fetchAllPages, actionDatabaseId })

    const actions = await findAllActions('fr')
    expect(actions).toEqual([
      {
        ...existing,
        slug: 'my-slug',
        trackingId: row.tracking_id,
        theme: validTheme,
        ruleId: row.rule_id,
        title: row.front_title_fr,
        longDescription: row.long_description_fr,
        media: {
          type: 'impact_co2',
          title: row.media_title_fr,
          data: {
            type: 'transport',
            options: { km: '10' },
          },
        },
        tips: row.tips_fr,
        financialIncentives: row.financial_incentives_fr,
        furtherExplore: row.further_explore_fr,
        metadata: {
          title: row.seo_title_fr,
          description: row.seo_description_fr,
          jsonLd: {
            '@context': 'https://schema.org',
            '@graph': [],
          },
        },
        publishedAt: new Date(row.published_at),
      } satisfies Action,
    ])
  })

  it('supports removing previously set optional fields', async () => {
    const existing = await actionFactory.create({
      slug: 'my-slug',
      tips: 'existing tips',
      financialIncentives: 'existing incentives',
      furtherExplore: 'existing further explore',
      media: {
        type: 'impact_co2',
        title: 'existing media title',
        data: {
          type: 'transport',
          options: { km: '5' },
        },
      },
      metadata: {
        title: 'existing seo title',
        description: 'existing seo description',
        jsonLd: { '@context': 'https://schema.org', '@graph': [] },
      },
      publishedAt: new Date('2025-01-01'),
    })
    const row = buildNotionRow({
      slug: 'my-slug',
      tips_fr: '',
      financial_incentives_fr: '',
      further_explore_fr: '',
      seo_title_fr: '',
      seo_description_fr: '',
      seo_json_ld: '',
      published_at: '',
      media_fr: '',
      media_title_fr: '',
    })
    const fetchAllPages = vi.fn().mockResolvedValue([row])

    await syncNotionActions({ fetchAllPages, actionDatabaseId })

    const actions = await findAllActions('fr')
    expect(actions).toEqual([
      {
        ...existing,
        slug: 'my-slug',
        trackingId: row.tracking_id,
        theme: validTheme,
        ruleId: row.rule_id,
        title: row.front_title_fr,
        longDescription: row.long_description_fr,
        media: undefined,
        tips: undefined,
        financialIncentives: undefined,
        furtherExplore: undefined,
        metadata: {
          title: undefined,
          description: undefined,
          jsonLd: undefined,
        },
        publishedAt: null,
      } satisfies Action,
    ])
  })

  it('soft-deletes actions absent from Notion', async () => {
    const toBeDeleted = await actionFactory.create()
    const controlRow = buildNotionRow() // different slug
    const fetchAllPages = vi.fn().mockResolvedValue([controlRow])

    await syncNotionActions({ fetchAllPages, actionDatabaseId })

    const { active, deleted } = await findAllActionsGroupedByStatus()
    expect(active).toEqual([expect.objectContaining({ slug: controlRow.slug })])
    expect(deleted).toEqual([{ ...toBeDeleted, deletedAt: expect.any(Date) }])
  })

  it('skips rows that fail schema validation', async () => {
    const row1 = buildNotionRow({ slug: 'INVALID SLUG!' })
    const row2 = buildNotionRow({ tracking_id: 'invalid tracking id!' })
    const fetchAllPages = vi.fn().mockResolvedValue([row1, row2])

    await syncNotionActions({ fetchAllPages, actionDatabaseId })

    expect(await findAllActions('fr')).toEqual([])
  })

  it('skips rows with unknown theme', async () => {
    const row = buildNotionRow({ theme: 'Invalid Theme' })
    const fetchAllPages = vi.fn().mockResolvedValue([row])

    await syncNotionActions({ fetchAllPages, actionDatabaseId })

    expect(await findAllActions('fr')).toEqual([])
  })

  it('does not soft-delete an existing action when an invalid row shares its slug', async () => {
    const existing = await actionFactory.create({ slug: 'my-slug' })
    // Row has correct slug but unknown theme thus fails theme validation
    // but slug is still in allNotionActionSlugs, so the DB action is protected
    const row = buildNotionRow({
      slug: 'my-slug',
      theme: 'Invalid Theme',
    })
    const fetchAllPages = vi.fn().mockResolvedValue([row])

    await syncNotionActions({ fetchAllPages, actionDatabaseId })

    expect(await findAllActions('fr')).toEqual([existing])
  })

  it('handles mixed create, update and soft-delete in one sync', async () => {
    const [toUpdate, toDelete] = await Promise.all([
      actionFactory.create({ slug: 'action-a' }),
      actionFactory.create({ slug: 'action-b' }),
    ])
    const updatedRow = buildNotionRow({
      slug: 'action-a',
      front_title_fr: 'Updated title',
    })
    const createdRow = buildNotionRow()
    const fetchAllPages = vi.fn().mockResolvedValue([updatedRow, createdRow])

    await syncNotionActions({ fetchAllPages, actionDatabaseId })

    const { active, deleted } = await findAllActionsGroupedByStatus()
    expect(sorted(active)).toEqual(
      sorted([
        {
          ...toUpdate,
          title: 'Updated title',
          trackingId: updatedRow.tracking_id,
          longDescription: updatedRow.long_description_fr,
          ruleId: updatedRow.rule_id,
          theme: validTheme,
          publishedAt: null,
        },
        {
          id: expect.any(String),
          title: createdRow.front_title_fr,
          slug: createdRow.slug,
          trackingId: createdRow.tracking_id,
          language: 'fr',
          longDescription: createdRow.long_description_fr,
          theme: validTheme,
          ruleId: createdRow.rule_id,
          media: undefined,
          tips: undefined,
          financialIncentives: undefined,
          furtherExplore: undefined,
          metadata: {
            title: undefined,
            description: undefined,
            jsonLd: undefined,
          },
          publishedAt: null,
          deletedAt: null,
        },
      ])
    )
    expect(deleted).toEqual([{ ...toDelete, deletedAt: expect.any(Date) }])
  })

  it('skips sync when Notion returns 0 rows to protect production data', async () => {
    const existing = await actionFactory.create()
    const fetchAllPages = vi.fn().mockResolvedValue([])

    await syncNotionActions({ fetchAllPages, actionDatabaseId })

    expect(await findAllActions('fr')).toEqual([existing])
  })

  describe('English translations', () => {
    it('always creates a French translation row alongside the legacy columns', async () => {
      const row = buildNotionRow({
        front_title_en: 'English title',
        slug_en: 'english-slug',
        long_description_en: 'English description',
      })
      const fetchAllPages = vi.fn().mockResolvedValue([row])

      await syncNotionActions({ fetchAllPages, actionDatabaseId })

      const [action] = await findAllActions('fr')
      const translation = await findActionTranslation(action.id, 'fr')
      expect(translation).toMatchObject({
        title: row.front_title_fr,
        longDescription: row.long_description_fr,
      })
    })

    it('creates an English translation when all required fields are present', async () => {
      const row = buildNotionRow({
        front_title_en: 'English title',
        slug_en: 'english-slug',
        long_description_en: 'English description',
        tips_en: 'English tips',
      })
      const fetchAllPages = vi.fn().mockResolvedValue([row])

      await syncNotionActions({ fetchAllPages, actionDatabaseId })

      const [action] = await findAllActions('fr')
      const translation = await findActionTranslation(action.id, 'en')
      expect(translation).toMatchObject({
        title: 'English title',
        longDescription: 'English description',
        tips: 'English tips',
      })
    })

    it('does not create an English translation when some of the required fields is missing, and warns', async () => {
      const warnSpy = vi.spyOn(logger, 'warn')
      const row = buildNotionRow({
        front_title_en: 'English title',
        slug_en: 'english-slug',
        long_description_en: undefined,
      })
      const fetchAllPages = vi.fn().mockResolvedValue([row])

      await syncNotionActions({ fetchAllPages, actionDatabaseId })

      const [action] = await findAllActions('fr')
      expect(await findActionTranslation(action.id, 'en')).toBeNull()
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('partial English translation'),
        expect.objectContaining({
          missing: 'front_title_en, slug_en',
        })
      )
    })

    it('does not create an English translation all required fields are missing', async () => {
      const row = buildNotionRow()
      const fetchAllPages = vi.fn().mockResolvedValue([row])

      await syncNotionActions({ fetchAllPages, actionDatabaseId })

      const [action] = await findAllActions('fr')
      expect(await findActionTranslation(action.id, 'en')).toBeNull()
    })

    it('updates an existing English translation on subsequent syncs (upsert, not duplicate)', async () => {
      const row = buildNotionRow({
        slug: 'my-slug',
        front_title_en: 'First English title',
        slug_en: 'english-slug',
        long_description_en: 'First English description',
      })
      const fetchAllPages = vi.fn().mockResolvedValue([row])
      await syncNotionActions({ fetchAllPages, actionDatabaseId })

      const updatedRow = {
        ...row,
        front_title_en: 'Second English title',
        long_description_en: 'Second English description',
      }
      await syncNotionActions({
        fetchAllPages: vi.fn().mockResolvedValue([updatedRow]),
        actionDatabaseId,
      })

      const [action] = await findAllActions('fr')
      const translations = await prisma.actionTranslation.findMany({
        where: { actionId: action.id, locale: 'en' },
      })
      expect(translations).toHaveLength(1)
      expect(translations[0]).toMatchObject({
        title: 'Second English title',
        longDescription: 'Second English description',
      })
    })

    it('deletes the English translation when Notion clears the _en fields', async () => {
      const row = buildNotionRow({
        slug: 'my-slug',
        front_title_en: 'English title',
        slug_en: 'english-slug',
        long_description_en: 'English description',
      })
      await syncNotionActions({
        fetchAllPages: vi.fn().mockResolvedValue([row]),
        actionDatabaseId,
      })
      const [createdAction] = await findAllActions('fr')
      expect(await findActionTranslation(createdAction.id, 'en')).not.toBeNull()

      const clearedRow = {
        ...row,
        front_title_en: '',
        slug_en: '',
        long_description_en: '',
      }
      await syncNotionActions({
        fetchAllPages: vi.fn().mockResolvedValue([clearedRow]),
        actionDatabaseId,
      })

      const [action] = await findAllActions('fr')
      expect(await findActionTranslation(action.id, 'en')).toBeNull()
      // French translation is untouched
      expect(await findActionTranslation(action.id, 'fr')).not.toBeNull()
    })

    it('only deletes the English translation when all required fields are missing, not when it is merely partial', async () => {
      const warnSpy = vi.spyOn(logger, 'warn')
      const row = buildNotionRow({
        slug: 'my-slug',
        front_title_en: 'English title',
        slug_en: 'english-slug',
        long_description_en: 'English description',
      })
      await syncNotionActions({
        fetchAllPages: vi.fn().mockResolvedValue([row]),
        actionDatabaseId,
      })
      const [createdAction] = await findAllActions('fr')
      const original = await findActionTranslation(createdAction.id, 'en')
      expect(original).not.toBeNull()

      const partiallyClearedRow = {
        ...row,
        long_description_en: '',
      }
      await syncNotionActions({
        fetchAllPages: vi.fn().mockResolvedValue([partiallyClearedRow]),
        actionDatabaseId,
      })

      const [action] = await findAllActions('fr')
      expect(await findActionTranslation(action.id, 'en')).toEqual(original)
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('partial English translation'),
        expect.objectContaining({
          missing: 'front_title_en, slug_en',
        })
      )
    })

    it('does not delete the French or English translations when the row fails schema validation', async () => {
      const row = buildNotionRow({
        slug: 'my-slug',
        front_title_en: 'English title',
        slug_en: 'english-slug',
        long_description_en: 'English description',
      })
      await syncNotionActions({
        fetchAllPages: vi.fn().mockResolvedValue([row]),
        actionDatabaseId,
      })
      const [createdAction] = await findAllActions('fr')
      const [originalFr, originalEn] = await Promise.all([
        findActionTranslation(createdAction.id, 'fr'),
        findActionTranslation(createdAction.id, 'en'),
      ])
      expect(originalFr).not.toBeNull()
      expect(originalEn).not.toBeNull()

      // media_fr fails schema validation, invalidating the whole row
      const rowWithInvalidFrenchMedia = {
        ...row,
        media_fr: 'not a valid impact co2 script',
      }
      await syncNotionActions({
        fetchAllPages: vi.fn().mockResolvedValue([rowWithInvalidFrenchMedia]),
        actionDatabaseId,
      })

      let [action] = await findAllActions('fr')
      expect(await findActionTranslation(action.id, 'fr')).toEqual(originalFr)
      expect(await findActionTranslation(action.id, 'en')).toEqual(originalEn)

      // media_en fails schema validation, invalidating the whole row
      const rowWithInvalidEnglishMedia = {
        ...row,
        media_en: 'not a valid impact co2 script',
      }
      await syncNotionActions({
        fetchAllPages: vi.fn().mockResolvedValue([rowWithInvalidEnglishMedia]),
        actionDatabaseId,
      })
      ;[action] = await findAllActions('fr')
      expect(await findActionTranslation(action.id, 'fr')).toEqual(originalFr)
      expect(await findActionTranslation(action.id, 'en')).toEqual(originalEn)
    })

    it('treats rows sharing the same English slug as untranslated, and warns', async () => {
      const warnSpy = vi.spyOn(logger, 'warn')
      const row1 = buildNotionRow({
        slug: 'slug-one',
        front_title_en: 'English title one',
        slug_en: 'shared-english-slug',
        long_description_en: 'English description one',
      })
      const row2 = buildNotionRow({
        slug: 'slug-two',
        front_title_en: 'English title two',
        slug_en: 'shared-english-slug',
        long_description_en: 'English description two',
      })
      const fetchAllPages = vi.fn().mockResolvedValue([row1, row2])

      await syncNotionActions({ fetchAllPages, actionDatabaseId })

      const actions = await findAllActions('fr')
      expect(actions).toHaveLength(2)
      const results = await Promise.all(
        actions.map((action) => findActionTranslation(action.id, 'en'))
      )
      expect(results).toEqual([null, null])

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('shares its English slug'),
        expect.objectContaining({ slugEn: 'shared-english-slug' })
      )
    })
  })
})

function buildNotionRow<T extends Partial<NotionRawRow> = Record<never, never>>(
  overrides: T = {} as T
): NotionRawRow & {
  ID: string
  theme: string
  rule_id: string
  slug: string
  tracking_id: string
  front_title_fr: string
  long_description_fr: string
} & T {
  const slug = faker.helpers
    .slugify(`${faker.lorem.words(3)}-${faker.string.uuid()}`)
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '')
  return {
    ID: '1',
    theme: 'Alimentation',
    rule_id: faker.string.uuid(),
    slug,
    tracking_id: slug.replace(/-/g, '_'),
    front_title_fr: faker.lorem.words(4),
    long_description_fr: faker.lorem.paragraph(),
    ...overrides,
  }
}

function sorted<T extends { slug: string }>(arr: T[]): T[] {
  return arr.toSorted((a, b) => a.slug.localeCompare(b.slug))
}

async function findAllActionsGroupedByStatus() {
  const allActions = await findAllActions('fr', { includeDeleted: true })
  const grouped = Object.groupBy(allActions, (a) =>
    a.deletedAt ? 'deleted' : 'active'
  )
  return { active: grouped.active ?? [], deleted: grouped.deleted ?? [] }
}

function findActionTranslation(actionId: string, locale: 'fr' | 'en') {
  return prisma.actionTranslation.findUnique({
    where: { actionId_locale: { actionId, locale } },
  })
}
