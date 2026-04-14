import type { Simulation } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

export interface Participant {
  id: string
  name: string
  simulation: Simulation
  userId?: string
  email?: string
}

export interface Group {
  id: string
  name: string
  emoji: string
  participants: Participant[]
  administrator: {
    name: string
    id: string
    email?: string
  }
}

export interface ValueObject {
  name: DottedName
  value: number
  mean?: number
  difference?: number
  isCategory?: boolean
}

export type CategoriesAndSubcategoriesFootprintsType = Record<
  DottedName,
  ValueObject
>

export interface PointsFortsFaiblesType {
  key: string
  resultObject: ValueObject
}

export interface Results {
  currentUserCategoriesAndSubcategoriesFootprints: CategoriesAndSubcategoriesFootprintsType
  groupCategoriesAndSubcategoriesFootprints: CategoriesAndSubcategoriesFootprintsType
  pointsForts: PointsFortsFaiblesType[]
  pointsFaibles: PointsFortsFaiblesType[]
}
