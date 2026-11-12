import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type Engine from 'publicodes'
import {
  getFootprintRules,
  ROOT_DOTTED_NAME,
} from '../../models/helpers/get-footprint-rules.ts'
import type { ComputedResults } from '../validators/computed-results.schema.ts'

/**
 * TODO: this is a duplicate of site code, refactor apps and server fixtures to use these functions.
 **/

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

export const getComputedResults = (
  engine: Engine<DottedName> | undefined
): ComputedResults => {
  if (!engine) {
    throw new Error('Engine is not defined')
  }

  const { categories, subcategories } = getFootprintRules(engine)

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
