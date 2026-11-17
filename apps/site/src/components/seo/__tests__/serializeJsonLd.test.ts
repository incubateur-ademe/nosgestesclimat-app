import { describe, expect, it } from 'vitest'
import { serializeJsonLd } from '../serializeJsonLd'

describe('serializeJsonLd', () => {
  it('serializes the documents as JSON', () => {
    expect(serializeJsonLd([{ '@type': 'WebPage' }])).toBe(
      '[{"@type":"WebPage"}]'
    )
  })

  it('escapes a closing script tag coming from the payload', () => {
    const payload = '</script><script>alert(1)</script>'
    const serialized = serializeJsonLd([{ name: payload }])

    expect(serialized).not.toContain('</script>')
    expect(JSON.parse(serialized)).toEqual([{ name: payload }])
  })

  it('drops the members that JSON cannot represent', () => {
    expect(
      serializeJsonLd([{ '@type': 'WebPage', description: undefined }])
    ).toBe('[{"@type":"WebPage"}]')
  })

  it('rejects a payload that is not a list of JSON documents', () => {
    expect(() => serializeJsonLd('{"@type":"WebPage"}')).toThrow()
    expect(() => serializeJsonLd([{ name: () => 'a function' }])).toThrow()
  })
})
