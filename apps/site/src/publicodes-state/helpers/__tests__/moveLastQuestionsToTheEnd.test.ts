import moveLastQuestionsToTheEnd from '@/publicodes-state/helpers/moveLastQuestionsToTheEnd'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { describe, expect, it } from 'vitest'

const q = (...names: string[]) => names as DottedName[]

describe('moveLastQuestionsToTheEnd', () => {
  it('moves the last questions to the end in order', () => {
    expect(
      moveLastQuestionsToTheEnd(
        q('profil . âge', 'logement . type', 'logement . lieu de vie')
      )
    ).toEqual(q('logement . type', 'logement . lieu de vie', 'profil . âge'))
  })

  it('keeps only the last questions that are present', () => {
    expect(
      moveLastQuestionsToTheEnd(q('profil . âge', 'logement . type'))
    ).toEqual(q('logement . type', 'profil . âge'))

    expect(
      moveLastQuestionsToTheEnd(q('logement . lieu de vie', 'logement . type'))
    ).toEqual(q('logement . type', 'logement . lieu de vie'))
  })

  it('does not change the order of the other questions', () => {
    expect(
      moveLastQuestionsToTheEnd(
        q('transport . voiture . km', 'alimentation . plats', 'logement . type')
      )
    ).toEqual(
      q('transport . voiture . km', 'alimentation . plats', 'logement . type')
    )
  })
})
