import Voiture from '@/components/custom-questions/Voiture'
import {
  computeAveragePassengers,
  computeTotal,
} from '@/components/custom-questions/voiture/journeys'
import type { Journey } from '@/types/journey'
import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { defineCustomQuestion } from '../types'

const VOITURE_RULENAME: DottedName = 'transport . voiture . km'
const VOYAGEURS_RULENAME: DottedName = 'transport . voiture . voyageurs'

/**
 * Voiture: the journeys list is a custom-question draft persisted to
 * localStorage; committing derives the total km and average passengers and
 * writes them through the single write bridge (the question itself is folded).
 */
const VoitureCustomQuestion = defineCustomQuestion<Journey[]>({
  match: (question) => question === VOITURE_RULENAME,
  Renderer: Voiture,
  draft: {
    load: ({ question }) =>
      JSON.parse(safeLocalStorage.getItem(question) ?? '[]') as Journey[],
    persist: (question, draft) =>
      safeLocalStorage.setItem(question, JSON.stringify(draft)),
  },
  onCommit: ({ draft: journeys }) => {
    const total = computeTotal(journeys)
    return {
      [VOITURE_RULENAME]: total,
      [VOYAGEURS_RULENAME]: computeAveragePassengers(journeys, total),
    }
  },
})

export default VoitureCustomQuestion
