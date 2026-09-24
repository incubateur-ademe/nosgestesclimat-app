export type PodiumCategory =
  | 'all'
  | 'companies'
  | 'associations'
  | 'education'
  | 'public-services'

export interface PodiumItem {
  id: string
  name: string
  slug: string
  type: PodiumCategory
  simulationsCount: number
}

export interface EventInfo {
  podiumItemsByCategory: Record<PodiumCategory, PodiumItem[]>
  totalSimulations: number
  organisationCount: number
  startDate: Date
  endDate: Date
}
