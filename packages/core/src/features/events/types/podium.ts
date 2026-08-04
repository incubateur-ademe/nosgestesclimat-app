export type PodiumCategory =
  | 'all'
  | 'companies'
  | 'associations'
  | 'education'
  | 'public-services'

export interface PodiumItem {
  rank: number
  label: string
  score: number
  category: PodiumCategory
}
