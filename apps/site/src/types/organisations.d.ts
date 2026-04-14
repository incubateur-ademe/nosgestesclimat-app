import type { OrganisationTypeEnum } from '@/constants/organisations/organisationTypes'
import type { ComputedResults } from '@/publicodes-state/types'
import type { FunFacts } from '@incubateur-ademe/nosgestesclimat'

interface User {
  id: string
  name?: string
  email?: string
}

interface VerifiedUser {
  id: string
  email: string
  name?: string | null
  telephone?: string | null
  position?: string | null
  optedInForCommunications: boolean
  createdAt: string
  updatedAt: string | null
  userId: string
}

interface BaseOrganisation {
  id: string
  name: string
  slug: string
  administrators?: [VerifiedUser]
  polls?: Omit<OrganisationPoll, 'simulations'>[]
  type?: OrganisationTypeEnum
  numberOfCollaborators?: number | null
  hasCustomQuestionEnabled?: boolean
  createdAt?: string
  updatedAt?: string | null
}

export type Organisation = Required<BaseOrganisation>

type PublicOrganisation = BaseOrganisation & {
  administrators?: undefined
  polls?: undefined
  type?: undefined
  numberOfCollaborators?: undefined
  hasCustomQuestionEnabled?: undefined
  createdAt?: undefined
  updatedAt?: undefined
}

interface BaseOrganisationPoll {
  id: string
  name: string
  slug: string
  expectedNumberOfParticipants?: number
  createdAt: string
  updatedAt: string
  organisation: Omit<Organisation, 'polls'> | PublicOrganisation
  simulations: {
    count: number
    finished: number
    hasParticipated: boolean
  }
  /**
   * computedResults de toutes les simulations (somme)
   */
  computedResults?: ComputedResults | null
  /**
   * computedResults de l'utilisateur si il a participé
   */
  userComputedResults?: ComputedResults
  /**
   * computedResults de toutes les simulations moins ceux de l'utilisateur si il a participé
   */
  otherComputedResults?: ComputedResults
  funFacts?: FunFacts | null
}

export type OrganisationPoll = BaseOrganisationPoll & {
  organisation: Omit<Organisation, 'polls'>
}

export type PublicOrganisationPoll = BaseOrganisationPoll & {
  organisation: PublicOrganisation
}

export type PublicPollSimulation = Pick<
  Simulation,
  'id' | 'date' | 'user' | 'computedResults' | 'additionalQuestionsAnswers'
>

export interface OrgaSettingsInputsType {
  name: string
  position?: string
  administratorFirstName?: string
  administratorLastName?: string
  administratorPosition?: string
  numberOfCollaborators?: number
  administratorTelephone?: string
  organisationType: OrganisationTypeEnum
}

export interface AcceptedExcelExportType {
  id: string
}

export interface ExcelExportType {
  url: string
}
