import type { DottedName, NGCRules } from '@incubateur-ademe/nosgestesclimat'
import type Engine from 'publicodes'
import logger from '../../../logger.js'
import type { SituationSchema } from '../simulations.validator.js'

const isDottedName = (dottedName: unknown): dottedName is DottedName =>
  typeof dottedName === 'string'

const evaluateSituationDottedName = ({
  dottedName,
  situation,
}: {
  situation: SituationSchema
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

type Operator = '<' | '>' | '=' | '>=' | '<='

const OPERATORS = new Set(['>', '<', '=', '>=', '<='])

const isOperator = (raw: string): raw is Operator => OPERATORS.has(raw)

const evaluateConditions = (
  operator: Operator,
  {
    left,
    right,
  }: { left: number; right: number } | { left: string; right: string }
) => {
  switch (operator) {
    case '<':
      return left < right
    case '>':
      return left > right
    case '=':
      return left === right
    case '>=':
      return left >= right
    case '<=':
      return left <= right
  }
}

const checkIfConditionIsTrue = ({
  conditionDottedName,
  situation,
}: {
  situation: SituationSchema
  conditionDottedName: unknown
  rules: Partial<NGCRules>
}): boolean => {
  if (!isDottedName(conditionDottedName)) {
    return false
  }

  const [dottedName, operator, value] = conditionDottedName
    .split(/(\s*(?:>=|<=|[=<>])\s*)/)
    .map((s) => s.trim())

  if (
    !dottedName ||
    // if the dottedName is not in the situation (default or no show) we consider the condition as false
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
      : evaluateSituationDottedName({
          dottedName,
          situation,
        })
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
  situation: SituationSchema
  formule: Record<string, unknown>
  rules: Partial<NGCRules>
}): number => {
  if ('variations' in formule && Array.isArray(formule.variations)) {
    const variations = [...formule.variations]
    const fallback = variations.pop()

    for (const variation of variations) {
      if (
        checkIfConditionIsTrue({
          conditionDottedName: variation.si,
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
      // TODO: fix me engine does not fallback correctly
      // return formule
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
    return formule['une de ces conditions'].some((conditionDottedName) =>
      checkIfConditionIsTrue({
        conditionDottedName,
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
    return formule['toutes ces conditions'].every((conditionDottedName) =>
      checkIfConditionIsTrue({
        conditionDottedName,
        situation,
        rules,
      })
    )
      ? 1
      : 0
  }

  return 0
}

export const getSituationDottedNameValue = ({
  dottedName,
  situation,
  rules,
}: {
  situation: SituationSchema
  dottedName: DottedName
  rules: Partial<NGCRules>
}): number => {
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
    logger.error(`Cannot evaluate dottedName ${dottedName}`, {
      situation,
      error,
    })

    return 0
  }
}

export const getSituationDottedNameValueWithEngine = ({
  dottedName,
  situation,
  engine,
}: {
  situation: SituationSchema
  dottedName: DottedName
  engine: Engine
}) => {
  try {
    engine.setSituation(situation)

    const value = engine.evaluate(dottedName).nodeValue

    if (typeof value === 'number' && !!value) {
      return value
    }

    if (value === true) {
      return 1
    }

    return 0
  } catch (error) {
    logger.error(`Cannot evaluate dottedName ${dottedName}`, {
      situation,
      error,
    })

    return 0
  }
}
