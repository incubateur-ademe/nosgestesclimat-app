import Textile from '@/components/custom-questions/Textile'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { utils } from 'publicodes'
import type { CustomQuestion } from '../types'

const TEXTILE_RULENAME: DottedName = 'divers . textile . volume'
const PRECISE_CHOICE: DottedName = 'divers . textile . choix précis'
const PRECISE_FOOTPRINT: DottedName = 'divers . textile . empreinte précise'
const TOTAL_PIECES: DottedName = 'divers . textile . nombre total'

/** The consumption profile the model expects for a given wardrobe size. */
const getProfile = (totalPieces: number): DottedName => {
  if (totalPieces <= 15) return 'divers . textile . volume . minimum'
  if (totalPieces <= 35)
    return 'divers . textile . volume . renouvellement occasionnel'
  return 'divers . textile . volume . accro au shopping'
}

/**
 * Textile: the detailed wardrobe implies the consumption profile. Once the
 * precise footprint is answered, the profile follows the piece count — the
 * renderer only shows the toggle and the detail.
 */
const TextileCustomQuestion: CustomQuestion = {
  match: (question) => question === TEXTILE_RULENAME,
  Renderer: Textile,
  derive: ({ situation, evaluate, childrenOf }) => {
    // The toggle is evaluated (`'non'` is a truthy string). The mosaic parent
    // never holds a situation entry of its own: its children do.
    if (evaluate(PRECISE_CHOICE)?.nodeValue !== true) return undefined
    // A mosaic child carries `null` at runtime ("not answered"), which its
    // type does not admit.
    const isFootprintAnswered = childrenOf(PRECISE_FOOTPRINT).some(
      (child) => (situation[child] as unknown) !== undefined && (situation[child] as unknown) !== null
    )
    if (!isFootprintAnswered) return undefined

    const totalPieces = Number(evaluate(TOTAL_PIECES)?.nodeValue)
    if (!Number.isFinite(totalPieces)) return undefined

    return { [TEXTILE_RULENAME]: utils.nameLeaf(getProfile(totalPieces)) }
  },
}

export default TextileCustomQuestion
