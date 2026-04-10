import type { Group } from '@/types/groups'
import type {
  DottedName,
  ExtendedSituation,
  Metrics,
  NGCRuleNode,
  NodeValue,
  SuggestionValue,
} from '@incubateur-ademe/nosgestesclimat'
import type PublicodesEngine from 'publicodes'
import type {
  EvaluatedNode,
  NodeKind,
  PublicodesExpression,
  ParsedRules as PublicodesParsedRules,
  Situation as PublicodesSituation,
} from 'publicodes'

// Utils

// Could be in index.d.ts as ambiant type
export type Entries<T> = [keyof T, T[keyof T]][]

// User and simulation types

export interface UserOrganisationInfo {
  administratorEmail?: string
  slug?: string
  name?: string
}

export interface RegionFromGeolocation {
  code: string
  name: string
}

export interface User {
  userId: string
  name?: string
  email?: string
  region?: RegionFromGeolocation
  initialRegion?: RegionFromGeolocation
  northStarRatings?: Record<string, unknown> // TODO: should be NorthStartType or something
  loginExpirationDate?: Date
  pendingVerification?: { expirationDate: Date; email: string }
  organisation?: UserOrganisationInfo
  administratorEmail?: string
}

export type Tutorials = Record<string, boolean>

export interface ComputedResultsSubcategories {
  transport: Record<DottedName, number>
  logement: Record<DottedName, number>
  alimentation: Record<DottedName, number>
  divers: Record<DottedName, number>
  'services sociétaux': Record<DottedName, number>
}

export interface ComputedResultsFootprint {
  bilan: number
  categories: Record<DottedName, number>
  subcategories?: Record<DottedName, number>
}
export type ComputedResults = Record<Metric, ComputedResultsFootprint>

export interface UpdateCurrentSimulationProps {
  situation?: Situation
  foldedSteps?: DottedName[]
  foldedStepToAdd?: {
    foldedStep: DottedName
    value?: NodeValue
    isMosaicParent?: boolean
    isMosaicChild?: boolean
  }
  actionChoices?: Partial<Record<DottedName, boolean>>
  defaultAdditionalQuestionsAnswers?: Record<string, string>
  customAdditionalQuestionsAnswers?: Record<string, string>
  computedResults?: ComputedResults
  progression?: number
  pollToAdd?: { id: string; slug: string } | null
  pollToDelete?: string | null
  groupToAdd?: string | null
  groupToDelete?: string | null
}

export interface Simulation {
  id: string
  date: Date | string
  situation: Situation
  extendedSituation: ExtendedSituation
  foldedSteps: DottedName[]
  actionChoices: Partial<Record<DottedName, boolean>>
  persona?: string
  computedResults: ComputedResults
  progression: number
  model?: string
  user?: { id: string; name?: string; email?: string }
  polls?: { id: string; slug: string }[]
  groups?: { id: string }[]
}

export interface LocalStorage {
  user: User
  tutorials: Tutorials
  simulations: Simulation[]
  currentSimulationId: string
  groupToRedirectToAfterTest?: Group
}

export type Metric = Metrics

export type Situation = PublicodesSituation<DottedName>

export type ParsedRules = PublicodesParsedRules<DottedName>

export type Engine = PublicodesEngine<DottedName>

export type MissingVariables = Record<DottedName, number>

export interface FormattedSuggestion {
  label: string
  value: SuggestionValue | Record<string, SuggestionValue>
}

export type Action = {
  dottedName: DottedName
  value: number
} & (EvaluatedNode & NGCRuleNode)

export type PublicodesValue = string | number | boolean

export type SafeEvaluate = <T extends PublicodesValue = PublicodesValue>(
  rule: PublicodesExpression,
  metric?: Metric
) => EvaluatedNode<NodeKind, T> | null
