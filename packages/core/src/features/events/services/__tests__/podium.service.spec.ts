import { describe, expect, it } from 'vitest'
import type { PodiumItem } from '../../types/podium.ts'
import { filterAndRankPodiumItems } from '../podium.service.ts'

const makeItem = (rank: number, category: PodiumItem['category']): PodiumItem => ({
  rank,
  label: `Org ${rank}`,
  score: 100 - rank,
  category,
})

describe('filterAndRankPodiumItems', () => {
  const items = [
    makeItem(1, 'companies'),
    makeItem(2, 'associations'),
    makeItem(3, 'companies'),
    makeItem(4, 'education'),
    makeItem(5, 'associations'),
    makeItem(6, 'companies'),
  ]

  it('keeps every item and re-ranks 1..n for the "all" filter', () => {
    const result = filterAndRankPodiumItems(items, 'all')

    expect(result.map((i) => i.rank)).toEqual([1, 2, 3, 4, 5, 6])
    expect(result.map((i) => i.category)).toEqual([
      'companies',
      'associations',
      'companies',
      'education',
      'associations',
      'companies',
    ])
  })

  it('filters by category and re-ranks 1..n (not the global rank)', () => {
    const result = filterAndRankPodiumItems(items, 'companies')

    expect(result).toHaveLength(3)
    expect(result.map((i) => i.category)).toEqual([
      'companies',
      'companies',
      'companies',
    ])
    expect(result.map((i) => i.rank)).toEqual([1, 2, 3])
  })

  it('returns an empty list when no item matches the category', () => {
    expect(filterAndRankPodiumItems(items, 'public-services')).toEqual([])
  })
})
