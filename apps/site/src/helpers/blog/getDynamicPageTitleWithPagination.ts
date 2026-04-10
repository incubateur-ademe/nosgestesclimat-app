import type { TFunction } from 'i18next'

export const getDynamicPageTitleWithPagination = ({
  metaTitle,
  pageNumber,
  pageCount,
  t,
}: {
  metaTitle?: string
  pageNumber?: number
  pageCount?: number
  t: TFunction<'translation', string>
}) => {
  return `${metaTitle ?? ''} ${
    typeof pageCount !== 'undefined' &&
    typeof pageNumber !== 'undefined' &&
    pageCount !== pageNumber
      ? ` - ${t(
          'blog.homePage.dynamicPageNumber',
          'page {{pageNumber}} sur {{pageCount}} - Nos Gestes Climat',
          { pageNumber, pageCount }
        )}`
      : ''
  }`
}
