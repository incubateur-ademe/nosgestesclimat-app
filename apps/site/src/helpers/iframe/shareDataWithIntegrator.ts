import { carboneMetric, eauMetric } from '@/constants/model/metric'
import type { ComputedResults } from '@/publicodes-state/types'

export function shareDataWithIntegrator(computedResults: ComputedResults) {
  const sharedData = {
    t: computedResults[carboneMetric].categories.transport,
    a: computedResults[carboneMetric].categories.alimentation,
    l: computedResults[carboneMetric].categories.logement,
    d: computedResults[carboneMetric].categories.divers,
    s: computedResults[carboneMetric].categories['services sociétaux'],
    footprints: {
      carbon: computedResults[carboneMetric],
      water: computedResults[eauMetric],
    },
  }

  window.parent.postMessage(
    { messageType: 'ngc-iframe-share', data: sharedData },
    '*'
  )
}
