import { faker } from '@faker-js/faker'
import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import type { NotionRawRow } from '../../sync-notion-actions.ts'
import { NotionActionRowSchema } from '../../sync-notion-actions.ts'

describe('NotionActionRowSchema', () => {
  const generateValidRow = (
    overrides: Partial<NotionRawRow> = {}
  ): NotionRawRow => ({
    ID: 123,
    theme: 'Alimentation',
    published_at: '2024-01-15',
    rule_id: faker.string.uuid(),
    slug: 'test-action',
    tracking_id: 'test_action',
    front_title_fr: 'Test Action',
    long_description_fr: 'This is a test description',
    ...overrides,
  })

  it('should validate a complete valid row', () => {
    const validRow = generateValidRow()

    const result = v.safeParse(NotionActionRowSchema, validRow)
    expect.assert(result.success)
    expect(result.output.ID).toBe(123)
    expect(result.output.slug).toBe('test-action')
    expect(result.output.tracking_id).toBe('test_action')
    expect(result.output.front_title_fr).toBe('Test Action')
    expect(result.output.long_description_fr).toBe('This is a test description')
  })

  it('should handle optional fields being undefined', () => {
    const minimalValidRow = {
      ID: '456',
      theme: 'Transport',
      rule_id: faker.string.uuid(),
      slug: 'minimal-action',
      tracking_id: 'minimal_action',
      front_title_fr: 'Minimal Action',
      long_description_fr: 'Minimal description',
    }

    const result = v.safeParse(NotionActionRowSchema, minimalValidRow)
    expect.assert(result.success)
  })

  describe('ID field', () => {
    it('should convert string ID to number', () => {
      const row = generateValidRow({ ID: '789' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.ID).toBe(789)
    })

    it('should fail if ID is not a valid number string', () => {
      const row = generateValidRow({ ID: 'not-a-number' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect(result.success).toBe(false)
    })

    it('should fail if ID is missing', () => {
      const row = generateValidRow()
      const { ID: _, ...rowWithoutId } = row
      const result = v.safeParse(NotionActionRowSchema, rowWithoutId)
      expect(result.success).toBe(false)
    })
  })

  describe('theme field', () => {
    it('should validate and transform theme to UUID', () => {
      const row = generateValidRow()
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.theme).toMatch(/^[0-9a-fA-F-]{36}$/)
    })

    it('should accept all valid theme options', () => {
      const validThemes = [
        'Alimentation',
        'Transport',
        'Services sociétaux',
        'Logement',
        'Divers',
      ]

      for (const theme of validThemes) {
        const row = generateValidRow({ theme })
        const result = v.safeParse(NotionActionRowSchema, row)
        expect.assert(result.success)
        expect(result.output.theme).toMatch(/^[0-9a-fA-F-]{36}$/)
      }
    })

    it('should fail if theme is not a valid option', () => {
      const row = generateValidRow({ theme: 'Invalid Theme' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect(result.success).toBe(false)
    })

    it('should fail if theme is missing', () => {
      const row = generateValidRow()
      const { theme: _, ...rowWithoutTheme } = row
      const result = v.safeParse(NotionActionRowSchema, rowWithoutTheme)
      expect(result.success).toBe(false)
    })
  })

  describe('published_at field', () => {
    it('should parse valid date string to Date object', () => {
      const row = generateValidRow({ published_at: '2024-01-15T10:30:00.000Z' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.published_at).toEqual(
        new Date('2024-01-15T10:30:00.000Z')
      )
    })

    it('should fail if published_at is not a valid date string', () => {
      const row = generateValidRow({ published_at: 'not-a-date' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect(result.success).toBe(false)
    })

    it('should accept null for published_at', () => {
      const row = generateValidRow({ published_at: null })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.published_at).toBeNull()
    })

    it('should convert empty string published_at to null', () => {
      const row = generateValidRow({ published_at: '' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.published_at).toBeNull()
    })
  })

  describe('rule_id field', () => {
    it('should validate UUID format', () => {
      const row = generateValidRow()
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
    })

    it('should fail if rule_id is not a valid UUID', () => {
      const row = generateValidRow({ rule_id: 'not-a-uuid' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect(result.success).toBe(false)
    })

    it('should trim whitespace from rule_id', () => {
      const uuid = faker.string.uuid()
      const row = generateValidRow({
        rule_id: ` ${uuid} `,
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.rule_id).toBe(uuid)
    })

    it('should accept uppercase UUID', () => {
      const ruleId = faker.string.uuid()
      const row = generateValidRow({
        rule_id: ruleId.toUpperCase(),
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.rule_id).toBe(ruleId)
    })
  })

  describe('slug field', () => {
    it('should validate lowercase alphanumeric with hyphens', () => {
      const validSlugs = [
        'simple',
        'with-hyphen',
        'multiple-hyphens-here',
        'with123numbers',
        'a',
        'a-b',
      ]

      for (const slug of validSlugs) {
        const row = generateValidRow({ slug })
        const result = v.safeParse(NotionActionRowSchema, row)
        expect.assert(result.success)
      }
    })

    it('should trim and lowercase slug', () => {
      const row = generateValidRow({
        slug: ' TEST-SLUG ',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.slug).toBe('test-slug')
    })

    it('should convert uppercase to lowercase and pass validation', () => {
      const row = generateValidRow({ slug: 'TestSlug' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.slug).toBe('testslug')
    })

    it('should accept slug with underscores', () => {
      const row = generateValidRow({ slug: 'test_slug' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.slug).toBe('test_slug')
    })

    it('should fail if slug has special characters', () => {
      const row = generateValidRow({ slug: 'test@slug' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect(result.success).toBe(false)
    })

    it('should fail if slug starts or ends with hyphen', () => {
      const invalidSlugs = ['-starts-with-hyphen', 'ends-with-hyphen-']

      for (const slug of invalidSlugs) {
        const row = generateValidRow({ slug })
        const result = v.safeParse(NotionActionRowSchema, row)
        expect(result.success).toBe(false)
      }
    })
  })

  describe('tracking_id field', () => {
    it('should validate lowercase alphanumeric with underscores', () => {
      const validTrackingIds = [
        'simple',
        'with_underscore',
        'multiple_underscores_here',
        'with123numbers',
        'a',
        'a_b',
      ]

      for (const trackingId of validTrackingIds) {
        const row = generateValidRow({ tracking_id: trackingId })
        const result = v.safeParse(NotionActionRowSchema, row)
        expect.assert(result.success)
      }
    })

    it('should trim and lowercase tracking_id', () => {
      const row = generateValidRow({
        tracking_id: ' TRACKING_ID ',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.tracking_id).toBe('tracking_id')
    })

    it('should fail if tracking_id has hyphens', () => {
      const row = generateValidRow({ tracking_id: 'test-tracking' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect(result.success).toBe(false)
    })

    it('should fail if tracking_id has special characters', () => {
      const row = generateValidRow({ tracking_id: 'test@tracking' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect(result.success).toBe(false)
    })
  })

  describe('front_title_fr and long_description_fr fields', () => {
    it('should trim whitespace from front_title_fr', () => {
      const row = generateValidRow({
        front_title_fr: '  Test Title  ',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.front_title_fr).toBe('Test Title')
    })

    it('should trim whitespace from long_description_fr', () => {
      const row = generateValidRow({
        long_description_fr: '  Test Description  ',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.long_description_fr).toBe('Test Description')
    })

    it('should accept empty string for front_title_fr after trimming', () => {
      const row = generateValidRow({
        front_title_fr: '   ',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.front_title_fr).toBe('')
    })

    it('should accept empty string for long_description_fr after trimming', () => {
      const row = generateValidRow({
        long_description_fr: '   ',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.long_description_fr).toBe('')
    })
  })

  describe('tips_fr field', () => {
    it('should handle tips_fr', () => {
      const row = generateValidRow({ tips_fr: 'Test tips' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.tips_fr).toBe('Test tips')
    })

    it('should accept null for tips_fr', () => {
      const row = generateValidRow({ tips_fr: null })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.tips_fr).toBeNull()
    })

    it('should convert empty string tips_fr to null', () => {
      const row = generateValidRow({ tips_fr: '' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.tips_fr).toBeNull()
    })
  })

  describe('financial_incentives_fr field', () => {
    it('should handle financial_incentives_fr', () => {
      const row = generateValidRow({
        financial_incentives_fr: 'Test incentives',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.financial_incentives_fr).toBe('Test incentives')
    })

    it('should accept null for financial_incentives_fr', () => {
      const row = generateValidRow({ financial_incentives_fr: null })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.financial_incentives_fr).toBeNull()
    })

    it('should convert empty string financial_incentives_fr to null', () => {
      const row = generateValidRow({ financial_incentives_fr: '' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.financial_incentives_fr).toBeNull()
    })
  })

  describe('further_explore_fr field', () => {
    it('should handle further_explore_fr', () => {
      const row = generateValidRow({
        further_explore_fr: 'Test further explore',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.further_explore_fr).toBe('Test further explore')
    })

    it('should accept null for further_explore_fr', () => {
      const row = generateValidRow({ further_explore_fr: null })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.further_explore_fr).toBeNull()
    })

    it('should convert empty string further_explore_fr to null', () => {
      const row = generateValidRow({ further_explore_fr: '' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.further_explore_fr).toBeNull()
    })
  })

  describe('seo metadata fields', () => {
    describe('seo_title_fr field', () => {
      it('should handle seo_title_fr', () => {
        const row = generateValidRow({ seo_title_fr: 'SEO Title' })
        const result = v.safeParse(NotionActionRowSchema, row)
        expect.assert(result.success)
        expect(result.output.seo_title_fr).toBe('SEO Title')
      })

      it('should accept null for seo_title_fr', () => {
        const row = generateValidRow({ seo_title_fr: null })
        const result = v.safeParse(NotionActionRowSchema, row)
        expect.assert(result.success)
        expect(result.output.seo_title_fr).toBeNull()
      })

      it('should convert empty string seo_title_fr to null', () => {
        const row = generateValidRow({ seo_title_fr: '' })
        const result = v.safeParse(NotionActionRowSchema, row)
        expect.assert(result.success)
        expect(result.output.seo_title_fr).toBeNull()
      })
    })

    describe('seo_description_fr field', () => {
      it('should handle seo_description_fr', () => {
        const row = generateValidRow({ seo_description_fr: 'SEO Description' })
        const result = v.safeParse(NotionActionRowSchema, row)
        expect.assert(result.success)
        expect(result.output.seo_description_fr).toBe('SEO Description')
      })

      it('should accept null for seo_description_fr', () => {
        const row = generateValidRow({ seo_description_fr: null })
        const result = v.safeParse(NotionActionRowSchema, row)
        expect.assert(result.success)
        expect(result.output.seo_description_fr).toBeNull()
      })

      it('should convert empty string seo_description_fr to null', () => {
        const row = generateValidRow({ seo_description_fr: '' })
        const result = v.safeParse(NotionActionRowSchema, row)
        expect.assert(result.success)
        expect(result.output.seo_description_fr).toBeNull()
      })
    })

    describe('seo_json_ld field', () => {
      it('should handle seo_json_ld', () => {
        const row = generateValidRow({
          seo_json_ld: '{"@context": "https://schema.org"}',
        })
        const result = v.safeParse(NotionActionRowSchema, row)
        expect.assert(result.success)
        expect(result.output.seo_json_ld).toEqual({
          '@context': 'https://schema.org',
        })
      })

      it('should fail if seo_json_ld is not valid JSON', () => {
        const row = generateValidRow({
          seo_json_ld: 'not valid json',
        })
        const result = v.safeParse(NotionActionRowSchema, row)
        expect(result.success).toBe(false)
      })

      it('should accept null for seo_json_ld', () => {
        const row = generateValidRow({ seo_json_ld: null })
        const result = v.safeParse(NotionActionRowSchema, row)
        expect.assert(result.success)
        expect(result.output.seo_json_ld).toBeNull()
      })

      it('should convert empty string seo_json_ld to null', () => {
        const row = generateValidRow({ seo_json_ld: '' })
        const result = v.safeParse(NotionActionRowSchema, row)
        expect.assert(result.success)
        expect(result.output.seo_json_ld).toBeNull()
      })
    })
  })

  describe('media fields', () => {
    it('should handle media_title_fr', () => {
      const row = generateValidRow({
        media_title_fr: 'Test Media Title',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.media_title_fr).toBe('Test Media Title')
    })

    it('should handle valid media_fr with simulation script', () => {
      const row = generateValidRow({
        media_fr:
          '<script data-name="impact-co2" src="https://example.com/script.js" data-type="simulation" data-search="mode=test"/>',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect.assert(result.output.media_fr)
      expect(result.output.media_fr).toEqual({
        type: 'impact_co2',
        title: '',
        data: {
          type: 'simulation',
          options: {
            mode: 'test',
          },
        },
      })
    })

    it('should fail if media_fr is invalid script', () => {
      const row = generateValidRow({
        media_fr: '<script>invalid</script>',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect(result.success).toBe(false)
    })

    it('should accept undefined media_fr', () => {
      const row = generateValidRow()
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.media_fr).toBeUndefined()
    })

    it('should accept null media_fr', () => {
      const row = generateValidRow({ media_fr: null })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.media_fr).toBeNull()
    })

    it('should convert empty string media_fr to null', () => {
      const row = generateValidRow({ media_fr: '' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.media_fr).toBeNull()
    })

    it('should convert whitespace-only media_fr to null', () => {
      const row = generateValidRow({ media_fr: '   ' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.media_fr).toBeNull()
    })

    it('should accept null media_title_fr', () => {
      const row = generateValidRow({ media_title_fr: null })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.media_title_fr).toBeNull()
    })

    it('should convert empty string media_title_fr to null', () => {
      const row = generateValidRow({ media_title_fr: '' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.media_title_fr).toBeNull()
    })
  })

  describe('front_title_en and long_description_en fields', () => {
    it('should be undefined when not provided (unlike the required _fr fields)', () => {
      const row = generateValidRow()
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.front_title_en).toBeUndefined()
      expect(result.output.long_description_en).toBeUndefined()
    })

    it('should trim whitespace from front_title_en', () => {
      const row = generateValidRow({ front_title_en: '  Test Title  ' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.front_title_en).toBe('Test Title')
    })

    it('should convert empty string front_title_en to null', () => {
      const row = generateValidRow({ front_title_en: '' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.front_title_en).toBeNull()
    })

    it('should trim whitespace from long_description_en', () => {
      const row = generateValidRow({
        long_description_en: '  Test Description  ',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.long_description_en).toBe('Test Description')
    })

    it('should convert empty string long_description_en to null', () => {
      const row = generateValidRow({ long_description_en: '' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.long_description_en).toBeNull()
    })
  })

  describe('slug_en field', () => {
    it('should be undefined when not provided', () => {
      const row = generateValidRow()
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.slug_en).toBeUndefined()
    })

    it('should trim and lowercase slug_en', () => {
      const row = generateValidRow({ slug_en: ' TEST-SLUG ' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.slug_en).toBe('test-slug')
    })

    it('should convert empty string slug_en to null', () => {
      const row = generateValidRow({ slug_en: '' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.slug_en).toBeNull()
    })

    it('should fail if slug_en has special characters', () => {
      const row = generateValidRow({ slug_en: 'test@slug' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect(result.success).toBe(false)
    })
  })

  describe('optional _en fields', () => {
    it.each([
      'tips_en',
      'financial_incentives_en',
      'further_explore_en',
      'seo_title_en',
      'seo_description_en',
      'media_title_en',
    ] as const)('should handle %s', (field) => {
      const row = generateValidRow({ [field]: `Test ${field}` })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output[field]).toBe(`Test ${field}`)
    })

    it.each([
      'tips_en',
      'financial_incentives_en',
      'further_explore_en',
      'seo_title_en',
      'seo_description_en',
      'media_title_en',
    ] as const)('should convert empty string %s to null', (field) => {
      const row = generateValidRow({ [field]: '' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output[field]).toBeNull()
    })
  })

  describe('media_en field', () => {
    it('should handle valid media_en with simulation script', () => {
      const row = generateValidRow({
        media_en:
          '<script data-name="impact-co2" src="https://example.com/script.js" data-type="simulation" data-search="mode=test"/>',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect.assert(result.output.media_en)
      expect(result.output.media_en).toEqual({
        type: 'impact_co2',
        title: '',
        data: {
          type: 'simulation',
          options: {
            mode: 'test',
          },
        },
      })
    })

    it('should fail if media_en is invalid script', () => {
      const row = generateValidRow({
        media_en: '<script>invalid</script>',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect(result.success).toBe(false)
    })

    it('should accept undefined media_en', () => {
      const row = generateValidRow()
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.media_en).toBeUndefined()
    })

    it('should convert empty string media_en to null', () => {
      const row = generateValidRow({ media_en: '' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.media_en).toBeNull()
    })
  })
})
