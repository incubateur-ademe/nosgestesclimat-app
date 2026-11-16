import type getType from '@/publicodes-state/helpers/getType'
import { safeEvaluateHelper } from '@/publicodes-state/helpers/safeEvaluateHelper'
import type { Engine } from '@/publicodes-state/types'
import type { DottedName, NodeValue } from '@incubateur-ademe/nosgestesclimat'
import { NUMBER_DELAY_MS } from './commitPolicy'
import type { DraftStore } from './useDraftStore'

interface ScalarProps {
  /** The step the edit belongs to: flushing it commits every edit of the step. */
  step: DottedName
  question: DottedName
  type: ReturnType<typeof getType>
  /** The committed answer, `undefined` when the question was never answered. */
  value: NodeValue
}

/**
 * The draft of a single-value question (number, boolean, choice): its pending
 * value, or the committed one.
 */
export const scalarDraft = (
  store: DraftStore,
  { step, question, type, value }: ScalarProps
) => {
  const draft = store.read(step)

  return {
    value: question in draft ? draft[question] : value,
    setValue: (next: NodeValue) =>
      store.stage(
        step,
        { [question]: next },
        type === 'number' ? NUMBER_DELAY_MS : 'idle'
      ),
  }
}

interface AssistanceProps {
  step: DottedName
  question: DottedName
  assistance: DottedName | undefined
  /** The committed assistance value, `undefined` when never answered. */
  value: number | undefined
  engine: Engine | undefined
}

/**
 * The two rules an assistance answer writes: the assistance itself, and the
 * question value the model derives from it. The derivation runs on a copy of
 * the engine, so it never touches the live situation.
 */
const assistancePatch = (
  engine: Engine | undefined,
  {
    question,
    assistance,
    value,
  }: { question: DottedName; assistance: DottedName; value: number | undefined }
): Partial<Record<DottedName, NodeValue>> => {
  if (!engine || value === undefined) {
    return { [assistance]: value }
  }

  const questionValue = safeEvaluateHelper(
    question,
    engine
      .shallowCopy()
      .setSituation({ [assistance]: value }, { keepPreviousSituation: true })
  )?.nodeValue

  // An evaluation failure leaves the question alone rather than erasing the
  // answer it already holds.
  if (questionValue === undefined || questionValue === null) {
    return { [assistance]: value }
  }
  return { [assistance]: value, [question]: questionValue }
}

/**
 * The draft of a number answered through its assistance rule: the user types in
 * the assistance field, and one commit writes both rules.
 */
export const assistanceDraft = (
  store: DraftStore,
  { step, question, assistance, value, engine }: AssistanceProps
) => {
  if (!assistance) return undefined

  const draft = store.read(step)

  return {
    value: (assistance in draft ? draft[assistance] : value) as
      | number
      | undefined,
    setValue: (next: number | undefined) =>
      store.stage(
        step,
        assistancePatch(engine, { question, assistance, value: next }),
        NUMBER_DELAY_MS
      ),
  }
}
