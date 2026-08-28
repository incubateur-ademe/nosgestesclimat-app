/**
 * Ported from the legacy server (apps/server/src/features/simulations/situation/situation.service.ts).
 * Does not meet core quality standards and will be replaced by an
 * engine-based evaluation in Phase 2.
 */
import type { DottedName, NGCRules } from '@incubateur-ademe/nosgestesclimat'
import type { Logger } from '../../../logger/index.ts'
import type { Situation } from '../../../simulations/validators/situation.schema.ts'

const isDottedName = (dottedName: unknown): dottedName is DottedName =>
  typeof dottedName === 'string'

const evaluateSituationDottedName = ({
  dottedName,
  situation,
}: {
  situation: Situation
  dottedName: unknown
}): number => {
  if (!isDottedName(dottedName)) {
    return 0
  }

  const rawValue = situation[dottedName]

  return typeof rawValue === 'object'
    ? 0
    : Number.isNaN(+rawValue)
      ? 0
      : +rawValue
}

type Operator = '<' | '>' | '=' | '>=' | '<=' | '!='

const OPERATORS = new Set(['>', '<', '=', '>=', '<=', '!='])

const isOperator = (raw: string): raw is Operator => OPERATORS.has(raw)

const evaluateConditions = (
  operator: Operator,
  { left, right }: { left: number | string; right: number | string }
) => {
  switch (operator) {
    case '<':
      return (left as number) < (right as number)
    case '>':
      return (left as number) > (right as number)
    case '=':
      return left === right
    case '>=':
      return (left as number) >= (right as number)
    case '<=':
      return (left as number) <= (right as number)
    case '!=':
      return left !== right
  }
}

const checkIfConditionIsTrue = ({
  rawCondition,
  situation,
  rules,
}: {
  rawCondition: unknown
  situation: Situation
  rules: Partial<NGCRules>
}): boolean => {
  // a condition can be a nested condition object (e.g. `une de ces conditions`
  // or `toutes ces conditions`), in which case we recursively evaluate it
  if (
    typeof rawCondition === 'object' &&
    rawCondition !== null &&
    !Array.isArray(rawCondition)
  ) {
    return (
      evaluateSituationFormula({
        situation,
        formule: rawCondition as Record<string, unknown>,
        rules,
      }) !== 0
    )
  }

  if (!isDottedName(rawCondition)) {
    return false
  }

  const [dottedName, operator, value] = rawCondition
    .split(/(\s*(?:>=|<=|!=|[=<>])\s*)/)
    .map((s) => s.trim())

  if (
    !dottedName ||
    situation[dottedName] === undefined ||
    situation[dottedName] === null
  ) {
    return false
  }

  if (!operator && !value) {
    return situation[dottedName] === 'oui'
  }

  const left =
    typeof situation[dottedName] === 'string'
      ? situation[dottedName]
      : evaluateSituationDottedName({ dottedName, situation })

  if (isOperator(operator) && value) {
    if (Number.isNaN(+value)) {
      return typeof left === 'string'
        ? evaluateConditions(operator, { left, right: value })
        : false
    }
    return typeof left === 'number'
      ? evaluateConditions(operator, { left, right: +value })
      : false
  }

  return false
}

const evaluateSituationFormula = ({
  situation,
  formule,
  rules,
}: {
  situation: Situation
  formule: Record<string, unknown>
  rules: Partial<NGCRules>
}): number => {
  if ('variations' in formule && Array.isArray(formule.variations)) {
    const variations = [...formule.variations]
    const fallback = variations.pop()

    for (const variation of variations) {
      if (
        checkIfConditionIsTrue({
          rawCondition: variation.si,
          situation,
          rules,
        })
      ) {
        if (typeof variation.alors === 'object') {
          return evaluateSituationFormula({
            formule: variation.alors,
            situation,
            rules,
          })
        }
        return +variation.alors || 0
      }
    }

    formule = fallback.sinon

    if (typeof formule === 'number') {
      return 0
    }
  }

  if ('moyenne' in formule && Array.isArray(formule.moyenne)) {
    const [moyenneDottedName] = formule.moyenne
    return evaluateSituationDottedName({
      situation,
      dottedName: moyenneDottedName,
    })
  }

  if ('somme' in formule && Array.isArray(formule.somme)) {
    return formule.somme.reduce(
      (acc, sommeDottedName) =>
        acc +
        evaluateSituationDottedName({
          situation,
          dottedName: sommeDottedName,
        }),
      0
    )
  }

  if (
    'une de ces conditions' in formule &&
    Array.isArray(formule['une de ces conditions'])
  ) {
    return formule['une de ces conditions'].some((rawCondition) =>
      checkIfConditionIsTrue({
        rawCondition,
        situation,
        rules,
      })
    )
      ? 1
      : 0
  }

  if (
    'toutes ces conditions' in formule &&
    Array.isArray(formule['toutes ces conditions'])
  ) {
    return formule['toutes ces conditions'].every((rawCondition) =>
      checkIfConditionIsTrue({
        rawCondition,
        situation,
        rules,
      })
    )
      ? 1
      : 0
  }

  return 0
}

export function createGetSituationDottedNameValue({
  logger,
}: {
  logger: Logger
}) {
  return function getSituationDottedNameValue({
    dottedName,
    situation,
    rules,
  }: {
    situation: Situation
    dottedName: DottedName
    rules: Partial<NGCRules>
  }): number {
    try {
      const rule = rules[dottedName]

      if (
        !rule ||
        typeof rule === 'string' ||
        !rule.formule ||
        typeof rule.formule !== 'object'
      ) {
        if (typeof rule?.formule === 'number') {
          return rule.formule
        }
        return 0
      }

      return evaluateSituationFormula({
        formule: rule.formule,
        situation,
        rules,
      })
    } catch (error) {
      logger.error('Cannot evaluate dottedName', { dottedName, error })
      return 0
    }
  }
}
