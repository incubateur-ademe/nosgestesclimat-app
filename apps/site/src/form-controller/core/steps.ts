import { SIMULATOR_INTERCALAIRE_PATH } from '@/constants/urls/paths'
import { getLinkToSimulateur } from '@/helpers/navigation/simulateurPages'
import getNamespace from '@/publicodes-state/helpers/getNamespace'
import { isLocale } from '@/utils/is-locale'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'

/**
 * A position in the form's navigation sequence. The form advances one step at a
 * time; the current step lives in the URL. A navigation position, not a
 * lifecycle state (never a Simulation status).
 */
export type Step =
  | { kind: 'question'; question: DottedName }
  | { kind: 'intercalaire'; category: DottedName }
  | { kind: 'end' }

export const questionStep = (question: DottedName): Step => ({
  kind: 'question',
  question,
})

/**
 * The category a step belongs to. The single place that decides it: a question
 * belongs to its namespace, an intercalaire names its own, the end has none.
 */
export const stepCategory = (step: Step): DottedName | undefined =>
  step.kind === 'question'
    ? getNamespace(step.question)
    : step.kind === 'intercalaire'
      ? step.category
      : undefined

const withSearchParams = (url: string, searchParams?: URLSearchParams) =>
  searchParams?.size ? `${url}?${searchParams.toString()}` : url

/** The URL of a question step. Always defined. */
export const questionUrl = (
  question: DottedName,
  searchParams?: URLSearchParams
): string => getLinkToSimulateur({ question, searchParams })

/** The URL a step lives at. `end` completes the simulation (no URL of its own). */
export const stepToUrl = (
  step: Step,
  searchParams?: URLSearchParams
): string | undefined => {
  if (step.kind === 'question') {
    return questionUrl(step.question, searchParams)
  }
  if (step.kind === 'intercalaire') {
    return withSearchParams(
      `${SIMULATOR_INTERCALAIRE_PATH}/${step.category}`,
      searchParams
    )
  }
  return undefined
}

/** Read the `?question=` param back into a dotted name. */
export const questionFromParam = (
  param: string | null
): DottedName | undefined => {
  if (!param) return undefined
  return param.replaceAll('.', ' . ').replaceAll('_', ' ') as DottedName
}

interface ResolveProps {
  pathname: string
  questionParam: string | null
  /** Folded questions still relevant (navigable back-targets). */
  relevantAnsweredQuestions: DottedName[]
  /** Questions still to ask, in form order. */
  remainingQuestions: DottedName[]
  isDebug: boolean
}

/** `/en/simulateur/bilan` → `/simulateur/bilan`: `usePathname` keeps the locale. */
const withoutLocale = (pathname: string): string => {
  const [, first, ...rest] = pathname.split('/')
  return isLocale(first) ? `/${rest.join('/')}` : pathname
}

/**
 * The current step is read from the URL (source of truth). A `?question=` is
 * honored only if the form knows the question — folded, or still to ask — and
 * otherwise falls back to the frontier, so a stale or hand-edited link cannot
 * land outside the form. On an intercalaire pathname the current step is the
 * intercalaire itself.
 */
export const resolveCurrentStep = ({
  pathname,
  questionParam,
  relevantAnsweredQuestions,
  remainingQuestions,
  isDebug,
}: ResolveProps): Step | undefined => {
  const path = withoutLocale(pathname)

  if (path.startsWith(SIMULATOR_INTERCALAIRE_PATH)) {
    const category = path.split('/').filter(Boolean).at(-1) as DottedName
    return { kind: 'intercalaire', category }
  }

  const question = questionFromParam(questionParam)
  const frontier = remainingQuestions.at(0)

  // Any question the form still asks is a valid entry point: the frontier
  // cannot be identified before the forgotten block is known, and a reload
  // during that block must not send the visitor back up the form.
  if (
    question &&
    (relevantAnsweredQuestions.includes(question) ||
      remainingQuestions.includes(question) ||
      isDebug)
  ) {
    return questionStep(question)
  }

  if (frontier) return questionStep(frontier)

  // Nothing left to ask: stay on the last answered question (next() completes).
  const lastAnswered = relevantAnsweredQuestions.at(-1)
  return lastAnswered ? questionStep(lastAnswered) : undefined
}
