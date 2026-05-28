import { describe, expect, it } from 'vitest'
import {
  convertNotionRichTextToMd,
  type RichTextItemResponse,
} from '../convert-notion-rich-text-to-md.ts'

describe('convertNotionRichTextToMd', () => {
  it('returns plain text unchanged', () => {
    expect(convertNotionRichTextToMd([textItem('hello')])).toBe('hello')
  })

  it('wraps bold text', () => {
    expect(convertNotionRichTextToMd([textItem('hello', { bold: true })])).toBe(
      '**hello**'
    )
  })

  it('wraps italic text', () => {
    expect(
      convertNotionRichTextToMd([textItem('hello', { italic: true })])
    ).toBe('*hello*')
  })

  it('wraps code text', () => {
    expect(convertNotionRichTextToMd([textItem('hello', { code: true })])).toBe(
      '`hello`'
    )
  })

  it('wraps strikethrough text', () => {
    expect(
      convertNotionRichTextToMd([textItem('hello', { strikethrough: true })])
    ).toBe('~~hello~~')
  })

  it('wraps underline text with HTML', () => {
    expect(
      convertNotionRichTextToMd([textItem('hello', { underline: true })])
    ).toBe('<u>hello</u>')
  })

  it('wraps linked text', () => {
    expect(
      convertNotionRichTextToMd([textItem('hello', {}, 'https://example.com')])
    ).toBe('[hello](https://example.com)')
  })

  it('combines bold and italic', () => {
    expect(
      convertNotionRichTextToMd([
        textItem('hello', { bold: true, italic: true }),
      ])
    ).toBe('***hello***')
  })

  it('combines bold and link — link wraps outermost', () => {
    expect(
      convertNotionRichTextToMd([
        textItem('hello', { bold: true }, 'https://example.com'),
      ])
    ).toBe('[**hello**](https://example.com)')
  })

  it('concatenates multiple items', () => {
    expect(
      convertNotionRichTextToMd([
        textItem('Hello '),
        textItem('world', { bold: true }),
        textItem('!'),
      ])
    ).toBe('Hello **world**!')
  })

  it('preserves newlines within items', () => {
    expect(convertNotionRichTextToMd([textItem('line1\nline2')])).toBe(
      'line1\nline2'
    )
  })

  it('falls back to plain_text for non-text types', () => {
    const mentionItem: RichTextItemResponse = {
      type: 'mention',
      mention: { type: 'page', page: { id: 'page-id' } },
      annotations: {
        bold: false,
        italic: false,
        strikethrough: false,
        underline: false,
        code: false,
        color: 'default',
      },
      plain_text: 'My Page',
      href: null,
    }
    expect(convertNotionRichTextToMd([mentionItem])).toBe('My Page')
  })

  it('returns empty string for empty array', () => {
    expect(convertNotionRichTextToMd([])).toBe('')
  })
})

function textItem(
  content: string,
  annotations: Partial<{
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
  }> = {},
  link?: string
): RichTextItemResponse {
  return {
    type: 'text',
    text: { content, link: link ? { url: link } : null },
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: 'default',
      ...annotations,
    },
    plain_text: content,
    href: link ?? null,
  }
}
