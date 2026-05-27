import { faker } from '@faker-js/faker'
import * as v from 'valibot'
import { describe, expect, it } from 'vitest'
import { NotionActionRowSchema } from '../sync-notion-actions.ts'

describe('NotionActionRowSchema', () => {
  const generateValidRow = (
    overrides: Partial<Record<string, string>> = {}
  ): Record<string, string> => ({
    ID: '123',
    theme_id: faker.string.uuid(),
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
      theme_id: faker.string.uuid(),
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

  describe('theme_id field', () => {
    it('should validate UUID format', () => {
      const row = generateValidRow()
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
    })

    it('should fail if theme_id is not a valid UUID', () => {
      const row = generateValidRow({ theme_id: 'not-a-uuid' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect(result.success).toBe(false)
    })

    it('should trim whitespace from theme_id', () => {
      const uuid = faker.string.uuid()
      const row = generateValidRow({
        theme_id: ` ${uuid} `,
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.theme_id).toBe(uuid)
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

    it('should fail if slug has underscores', () => {
      const row = generateValidRow({ slug: 'test_slug' })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect(result.success).toBe(false)
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

  it('should handle tips, financial_incentives, and further_explore fields', () => {
    const row = generateValidRow({
      tips_fr: 'Test tips',
      financial_incentives_fr: 'Test incentives',
      further_explore_fr: 'Test further explore',
    })
    const result = v.safeParse(NotionActionRowSchema, row)
    expect.assert(result.success)
    expect(result.output.tips_fr).toBe('Test tips')
    expect(result.output.financial_incentives_fr).toBe('Test incentives')
    expect(result.output.further_explore_fr).toBe('Test further explore')
  })

  describe('seo metadata fields', () => {
    it('should handle seo fields', () => {
      const row = generateValidRow({
        seo_title_fr: 'SEO Title',
        seo_description_fr: 'SEO Description',
        seo_json_ld: '{"@context": "https://schema.org"}',
      })
      const result = v.safeParse(NotionActionRowSchema, row)
      expect.assert(result.success)
      expect(result.output.seo_title_fr).toBe('SEO Title')
      expect(result.output.seo_description_fr).toBe('SEO Description')
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
  })
})
