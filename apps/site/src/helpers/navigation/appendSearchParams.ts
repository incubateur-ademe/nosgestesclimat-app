import type { SearchParams } from 'next/dist/server/request/search-params'
import type { ReadonlyURLSearchParams } from 'next/navigation'

interface Props {
  urlOrPathname: string
  searchParams: ReadonlyURLSearchParams | SearchParams | undefined
}

export function appendSearchParams({
  urlOrPathname,
  searchParams,
}: Props): string {
  if (!searchParams) return urlOrPathname

  const urlSearchParams = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      value.forEach((singleValue) => urlSearchParams.append(key, singleValue))
    } else if (value !== undefined) {
      urlSearchParams.append(key, value)
    }
  }

  return `${urlOrPathname}?${urlSearchParams.toString()}`
}
