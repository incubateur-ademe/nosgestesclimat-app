import type {
  DottedName,
  FunFacts,
  NGCRules,
} from '@incubateur-ademe/nosgestesclimat'
import modelRules from '@incubateur-ademe/nosgestesclimat/public/co2-model.FR-lang.fr.json' with { type: 'json' }
import modelFunFacts from '@incubateur-ademe/nosgestesclimat/public/funFactsRules.json' with { type: 'json' }
import personas from '@incubateur-ademe/nosgestesclimat/public/personas-fr.json' with { type: 'json' }
import Engine from 'publicodes'

import { describe, expect, test } from 'vitest'
import type { SituationSchema } from '../../simulations.validator.js'
import { getSituationDottedNameValue } from '../situation.service.js'

const frRules = modelRules as Partial<NGCRules>
const funFactsRules = modelFunFacts as { [k in keyof FunFacts]: DottedName }

const engine = new Engine(modelRules, {
  logger: {
    log: () => null,
    warn: () => null,
    error: console.error,
  },
})

const getEngineSituationDottedNameValue = ({
  situation,
  dottedName,
}: {
  situation: SituationSchema
  dottedName: DottedName
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
  } catch {
    return 0
  }
}

describe('getSituationDottedNameValue', () => {
  describe.each(
    Object.entries(funFactsRules)
      .filter(([_, dottedName]) => dottedName in frRules)
      .map(([funFactRule, dottedName]) => ({ funFactRule, dottedName }))
  )('Given $funFactRule', ({ dottedName }) => {
    describe.each(
      Object.values(personas).map(({ nom, situation }) => ({ nom, situation }))
    )('When computing funfacts for persona $nom', ({ situation }) => {
      test.skip('Should give the same result as the engine', () => {
        // console.time('algoValue')
        const algoValue = getSituationDottedNameValue({
          dottedName,
          situation,
          rules: frRules,
        })
        // console.timeEnd('algoValue')

        // console.time('engineValue')
        const engineValue = getEngineSituationDottedNameValue({
          situation,
          dottedName,
        })
        // console.timeEnd('engineValue')

        expect(algoValue).toBe(engineValue)
      })
    })
  })
})
