import {
  isMajorQuestion,
  LAST_QUESTIONS,
  MAJOR_QUESTIONS,
  NON_PRIORITY_QUESTIONS,
  PRIORITY_QUESTIONS,
} from '@/publicodes-state/constants/questions'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { describe, expect, it } from 'vitest'

const q = (name: string) => name as DottedName

describe('isMajorQuestion', () => {
  it('accepts every major root', () => {
    MAJOR_QUESTIONS.forEach((root) => {
      expect(isMajorQuestion(root)).toBe(true)
    })
  })

  it('accepts descendants of a major root', () => {
    expect(isMajorQuestion(q('logement . chauffage . bois . système'))).toBe(
      true
    )
    expect(
      isMajorQuestion(q('divers . numérique . appareils . téléphone . nombre'))
    ).toBe(true)
  })

  it('rejects questions outside the major roots', () => {
    expect(isMajorQuestion(q('logement . propriétaire'))).toBe(false)
    expect(
      isMajorQuestion(q('divers . numérique . internet . durée journalière'))
    ).toBe(false)
  })

  it('does not treat a longer name sharing the root as a descendant', () => {
    expect(isMajorQuestion(q('logement . types'))).toBe(false)
  })
})

describe('LAST_QUESTIONS', () => {
  it('keeps the living place before the age', () => {
    expect(LAST_QUESTIONS).toEqual(['logement . lieu de vie', 'profil . âge'])
  })
})

describe('priority questions', () => {
  it('only contains major questions', () => {
    ;[...PRIORITY_QUESTIONS, ...NON_PRIORITY_QUESTIONS].forEach((question) => {
      expect(isMajorQuestion(question)).toBe(true)
    })
  })

  it('no longer deprioritizes the consumption precision question', () => {
    expect(
      NON_PRIORITY_QUESTIONS.has(
        q('logement . chauffage . saisie précision consommation')
      )
    ).toBe(false)
  })
})
