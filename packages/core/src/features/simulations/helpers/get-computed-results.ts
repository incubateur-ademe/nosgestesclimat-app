import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type Engine from 'publicodes'
import { utils } from 'publicodes'
import type { ComputedResults } from '../validators/computed-results.schema.ts'
import { getSomme } from './get-somme.ts'

/**
 * TODO: this is a duplicate of site code, refactor apps and server fixtures to use these functions.
 **/

const ROOT_DOTTED_NAME = 'bilan' as DottedName

const METRICS = ['carbone', 'eau'] as const

type Metric = (typeof METRICS)[number]

const valueForMetric = ({
  engine,
  dottedName,
  metric,
}: {
  engine: Engine
  dottedName: DottedName
  metric: Metric
}): number => {
  const value = engine.evaluate({
    valeur: dottedName,
    contexte: { métrique: `'${metric}'` },
  }).nodeValue

  return typeof value === 'number' ? value : 0
}

export const getComputedResults = (engine: Engine): ComputedResults => {
  const parsedRules = engine.getParsedRules()

  const categories =
    getSomme(engine.getRule(ROOT_DOTTED_NAME)?.rawNode) ?? ([] as DottedName[])

  const subcategories = categories.flatMap((category) =>
    (getSomme(engine.getRule(category)?.rawNode) ?? []).map(
      (partialName) =>
        utils.disambiguateReference(
          parsedRules,
          category,
          partialName
        ) as DottedName
    )
  )

  return Object.fromEntries(
    METRICS.map((metric) => [
      metric,
      {
        bilan: valueForMetric({ engine, dottedName: ROOT_DOTTED_NAME, metric }),
        categories: Object.fromEntries(
          categories.map((category) => [
            category,
            valueForMetric({ engine, dottedName: category, metric }),
          ])
        ),
        subcategories: Object.fromEntries(
          subcategories.map((subcategory) => [
            subcategory,
            valueForMetric({ engine, dottedName: subcategory, metric }),
          ])
        ),
      },
    ])
  ) as ComputedResults
}
