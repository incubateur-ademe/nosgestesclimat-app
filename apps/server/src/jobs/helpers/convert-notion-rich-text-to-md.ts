import type { Client } from '@notionhq/client'

type NotionDatabaseResult = Awaited<
  ReturnType<Client['databases']['query']>
>['results'][number]
type PageObjectResponse = Extract<
  NotionDatabaseResult,
  { object: 'page'; properties: unknown }
>
type NotionProperty = PageObjectResponse['properties'][string]
type RichTextProperty = Extract<NotionProperty, { type: 'rich_text' }>
export type RichTextItemResponse = RichTextProperty['rich_text'][number]

export function convertNotionRichTextToMd(
  items: RichTextItemResponse[]
): string {
  return items.map(convertItem).join('')
}

function convertItem(item: RichTextItemResponse): string {
  if (item.type !== 'text') return item.plain_text

  let text = item.text.content
  const { bold, italic, strikethrough, underline, code } = item.annotations
  const link = item.text.link?.url

  if (code) text = `\`${text}\``
  if (strikethrough) text = `~~${text}~~`
  if (underline) text = `<u>${text}</u>`
  if (italic) text = `*${text}*`
  if (bold) text = `**${text}**`
  if (link) text = `[${text}](${link})`

  return text
}
