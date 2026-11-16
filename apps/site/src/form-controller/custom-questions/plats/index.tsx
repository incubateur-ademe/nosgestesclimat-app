import Plats from '@/components/custom-questions/Plats'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import type { CustomQuestion } from '../types'

const PLAT_RULENAME: DottedName = 'alimentation . plats'

/** Plats: renderer-only — the generic Question plus the dishes-per-week hint. */
const PlatsCustomQuestion: CustomQuestion = {
  match: (question) => question === PLAT_RULENAME,
  Renderer: Plats,
}

export default PlatsCustomQuestion
