import { describe, expect, it } from 'vitest'
import { parseImpactCO2Script } from '../parse-impact-co2-script.ts'

describe('parseImpactCO2Script', () => {
  describe('successful parsing', () => {
    it('should parse script with attributes in original order', () => {
      const html =
        '<script data-name="impact-co2" src="https://example.com/script.js" data-type="test" data-search="key=value" />'
      const result = parseImpactCO2Script(html)
      expect.assert(result.success)
      expect(result.data.src).toBe('https://example.com/script.js')
      expect(result.data.type).toBe('test')
      expect(result.data.searchParams.get('key')).toBe('value')
    })

    it('should parse script with non self closing tag', () => {
      const html =
        '<script data-name="impact-co2" src="https://example.com/script.js" data-type="test" data-search="key=value"></script>'
      const result = parseImpactCO2Script(html)
      expect.assert(result.success)
      expect(result.data.src).toBe('https://example.com/script.js')
      expect(result.data.type).toBe('test')
      expect(result.data.searchParams.get('key')).toBe('value')
    })

    it('should parse script with attributes in different order', () => {
      const html =
        '<script src="https://example.com/script.js" data-type="test" data-name="impact-co2" data-search="key=value" />'
      const result = parseImpactCO2Script(html)
      expect.assert(result.success)
      expect(result.data.src).toBe('https://example.com/script.js')
      expect(result.data.type).toBe('test')
      expect(result.data.searchParams.get('key')).toBe('value')
    })

    it('should parse script with extra attributes', () => {
      const html =
        '<script data-name="impact-co2" src="https://example.com/script.js" data-type="test" data-search="key=value" async defer />'
      const result = parseImpactCO2Script(html)
      expect.assert(result.success)
      expect(result.data.src).toBe('https://example.com/script.js')
      expect(result.data.type).toBe('test')
    })

    it('should parse script with multiple search params', () => {
      const html =
        '<script data-name="impact-co2" src="https://example.com/script.js" data-type="test" data-search="key1=value1&key2=value2" />'
      const result = parseImpactCO2Script(html)
      expect.assert(result.success)
      expect(result.data.searchParams.get('key1')).toBe('value1')
      expect(result.data.searchParams.get('key2')).toBe('value2')
    })

    it('should parse script with whitespace variations', () => {
      const html =
        '<script\n  data-name="impact-co2"\n  src="https://example.com/script.js"\n  data-type="test"\n  data-search="key=value"\n/>'
      const result = parseImpactCO2Script(html)
      expect.assert(result.success)
      expect(result.data.src).toBe('https://example.com/script.js')
    })
  })

  describe('error handling', () => {
    it('should return error when script tag is missing', () => {
      const html = ''
      const result = parseImpactCO2Script(html)
      expect.assert(!result.success)
      expect(result.error).toContain('missing data-name attribute')
    })

    it('should return error when data-name is missing', () => {
      const html =
        '<script src="https://example.com/script.js" data-type="test" data-search="key=value" />'
      const result = parseImpactCO2Script(html)
      expect.assert(!result.success)
      expect(result.error).toContain('missing data-name attribute')
    })

    it('should return error when src is missing', () => {
      const html =
        '<script data-name="impact-co2" data-type="test" data-search="key=value" />'
      const result = parseImpactCO2Script(html)
      expect.assert(!result.success)
      expect(result.error).toContain('missing required attributes')
    })

    it('should return error when type is missing', () => {
      const html =
        '<script data-name="impact-co2" src="https://example.com/script.js" data-search="key=value" />'
      const result = parseImpactCO2Script(html)
      expect.assert(!result.success)
      expect(result.error).toContain('missing required attributes')
    })

    it('should return error when search is missing', () => {
      const html =
        '<script data-name="impact-co2" src="https://example.com/script.js" data-type="test" />'
      const result = parseImpactCO2Script(html)
      expect.assert(!result.success)
      expect(result.error).toContain('missing required attributes')
    })

    it('should return error when data-name has wrong value', () => {
      const html =
        '<script data-name="wrong-name" src="https://example.com/script.js" data-type="test" data-search="key=value" />'
      const result = parseImpactCO2Script(html)
      expect.assert(!result.success)
      expect(result.error).toContain('missing data-name attribute')
    })

    it('should return error for malformed script tag', () => {
      const html =
        'script data-name="impact-co2" src="https://example.com/script.js" data-type="test" data-search="key=value">'
      const result = parseImpactCO2Script(html)
      expect.assert(!result.success)
    })
  })
})
