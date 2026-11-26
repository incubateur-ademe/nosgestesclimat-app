import type { Simulation } from '@/helpers/server/model/simulations'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

/**
 * What the other participants expose of their simulation: the aggregates
 * needed by the group comparison features, and nothing else (their raw
 * answers are not ours to read).
 */
export type ParticipantSimulationSummary = Pick<
  Simulation,
  'computedResults' | 'status'
>

interface BaseParticipant {
  id: string
  /** Null until the participant has given their name. */
  name: string | null
}

/**
 * The connected user's own entry — the only one the API identifies (`userId`,
 * `email`) and the only one carrying a full simulation.
 */
export interface OwnParticipant extends BaseParticipant {
  userId: string
  email: string | null
  simulation: Simulation
}

/** Any other participant: aggregates only, no identifying fields. */
export interface OtherParticipant extends BaseParticipant {
  userId?: undefined
  email?: undefined
  simulation: ParticipantSimulationSummary
}

/**
 * Mirrors `participantToDto` server-side: identity and full simulation travel
 * together, so a participant matched on `userId` is always the full-simulation
 * one.
 */
export type Participant = OwnParticipant | OtherParticipant

interface BaseGroupAdministrator {
  /**
   * Null until the administrator has given their name, absent when the group
   * has no administrator row at all.
   */
  name?: string | null
}

/** Returned when the connected user administrates the group. */
export interface OwnGroupAdministrator extends BaseGroupAdministrator {
  id: string
  email: string | null
}

/**
 * Returned to everybody else: the administrator's display name, nothing more.
 * `id` is withheld, so it can never be compared against another user's.
 */
export interface OtherGroupAdministrator extends BaseGroupAdministrator {
  id?: undefined
  email?: undefined
}

/**
 * Mirrors `groupToDto` server-side, which only identifies the administrator to
 * themselves — see {@link isGroupOwner}.
 */
export type GroupAdministrator = OwnGroupAdministrator | OtherGroupAdministrator

export interface Group {
  id: string
  name: string
  emoji: string
  participants: Participant[]
  administrator: GroupAdministrator
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
