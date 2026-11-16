import type { Situation } from '@/publicodes-state/types'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { MOSAIC_NUMBER_DELAY_MS } from './commitPolicy'
import type { DraftStore } from './useDraftStore'

export type MosaicValue = boolean | number | '' | undefined | null
export type MosaicComposite = Record<DottedName, MosaicValue>

function ouiNonToBoolean(value: unknown): MosaicValue {
  if (value === 'oui') return true
  if (value === 'non') return false
  return value as MosaicValue
}

/**
 * The committed values of a mosaic's children, as its draft's base. `null` in
 * the situation means "not answered for this child", which the composite holds
 * as `undefined`.
 */
export const situationComposite = (
  children: DottedName[],
  situation: Situation
): MosaicComposite =>
  Object.fromEntries(
    children.map((child) => {
      // The situation type does not admit `null`, but a mosaic child carries it
      // at runtime: it is how "not answered for this child" is stored.
      const raw: unknown = situation[child]
      return [child, raw === null ? undefined : ouiNonToBoolean(raw)]
    })
  ) as MosaicComposite

const uniform = (children: DottedName[], value: MosaicValue): MosaicComposite =>
  Object.fromEntries(children.map((c) => [c, value])) as MosaicComposite

const isNo = (value: MosaicValue): boolean =>
  value === false || value === 0 || value === null

/** "Aucun" answers "no" everywhere: every child is false, zero, or emptied. */
export const isAucun = (
  children: DottedName[],
  values: MosaicComposite
): boolean => children.length > 0 && children.every((c) => isNo(values[c]))

/**
 * The mosaic's values: the pending edit where one is staged, the committed ones
 * otherwise.
 */
export const readMosaicValues = (
  store: DraftStore,
  step: DottedName,
  children: DottedName[],
  situation: Situation
): MosaicComposite => {
  const draft = store.read(step)
  const pending = Object.fromEntries(
    children.filter((child) => child in draft).map((c) => [c, draft[c]])
  )
  return {
    ...situationComposite(children, situation),
    ...pending,
  } as MosaicComposite
}

/**
 * The mosaic coupling rules, pure: the first edit of an untouched mosaic sets
 * every child to null; turning off the last true child resets the mosaic to its
 * defaults, which is a removal from the situation.
 */
function applyMosaicEdit(
  current: MosaicComposite,
  children: DottedName[],
  child: DottedName,
  value: MosaicValue
): MosaicComposite {
  let composite = { ...current }
  if (Object.values(composite).every((v) => v === undefined)) {
    composite = uniform(children, null)
  }
  composite[child] = value
  if (value === false && Object.values(composite).every((v) => v === false)) {
    composite = uniform(children, undefined)
  }
  return composite
}

interface MosaicDraftProps {
  /** The step the mosaic belongs to: flushing it commits every edit of the step. */
  step: DottedName
  children: DottedName[]
  situation: Situation
}

/**
 * The draft of a mosaic question: a composite of its children's pending values,
 * staged as one patch. `null` is the draft's "not answered"; the write service
 * turns it into the situation's `'non'` or `0`.
 */
export const mosaicDraft = (
  store: DraftStore,
  { step, children, situation }: MosaicDraftProps
) => {
  const values = readMosaicValues(store, step, children, situation)

  // Clearing a number field is still part of a typing burst.
  const mosaicDelay = (value: MosaicValue) =>
    typeof value === 'number' || value === '' ? MOSAIC_NUMBER_DELAY_MS : 'idle'

  return {
    values,
    aucun: isAucun(children, values),
    setChildValue: (child: DottedName, value: MosaicValue) =>
      store.stage(
        step,
        applyMosaicEdit(values, children, child, value),
        mosaicDelay(value)
      ),
    setAucun: (selected: boolean) =>
      store.stage(step, uniform(children, selected ? null : undefined), 'idle'),
  }
}
