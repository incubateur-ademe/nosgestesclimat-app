import type { SearchParams } from 'next/dist/server/request/search-params'

export const getPageNumber = async (
  searchParams: Promise<SearchParams> | undefined
) => {
  // Get the page number from the query params from the server side
  const pageParam = searchParams ? (await searchParams).page : undefined

  return Number(pageParam) || 1
}
