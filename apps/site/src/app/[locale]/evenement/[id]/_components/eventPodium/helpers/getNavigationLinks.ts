import { buildFilterHref, FILTER_VALUES, type FilterValue } from '../EventTabs'

export function getNavigationParameters({
  params,
  activeCategoryFilter,
}: {
  params: Record<string, string | string[] | undefined>
  activeCategoryFilter: FilterValue
}): {
  prevHref: string | null
  nextHref: string | null
} {
  const activeIndex = FILTER_VALUES.indexOf(activeCategoryFilter)
  const prevFilter =
    activeIndex > 0 ? FILTER_VALUES[activeIndex - 1] : undefined
  const nextFilter =
    activeIndex < FILTER_VALUES.length - 1
      ? FILTER_VALUES[activeIndex + 1]
      : undefined

  return {
    prevHref: prevFilter ? buildFilterHref(params, prevFilter) : null,
    nextHref: nextFilter ? buildFilterHref(params, nextFilter) : null,
  }
}
