import type { PodiumCategory, PodiumItem } from './eventPageData'

/**
 * Filter podium items by category and re-rank them 1..n for display.
 * Ranks must be recomputed after filtering so the podium styling
 * (first/second/third blocks, badges) matches the filtered list.
 */
export function filterAndRankPodiumItems(
  items: PodiumItem[],
  activeFilter: PodiumCategory | 'all'
): PodiumItem[] {
  const filtered =
    activeFilter === 'all'
      ? items
      : items.filter((item) => item.category === activeFilter)

  return filtered.map((item, index) => ({ ...item, rank: index + 1 }))
}
