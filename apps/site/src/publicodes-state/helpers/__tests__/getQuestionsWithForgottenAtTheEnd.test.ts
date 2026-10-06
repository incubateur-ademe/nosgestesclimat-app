import getQuestionsWithForgottenAtTheEnd from '@/publicodes-state/helpers/getQuestionsWithForgottenAtTheEnd'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { describe, expect, it } from 'vitest'

const q = (...names: string[]) => names as DottedName[]
const one = (name: string) => name as DottedName

describe('getQuestionsWithForgottenAtTheEnd', () => {
  it('returns the lists as is when there is no forgotten question', () => {
    const relevantQuestions = q('a', 'b', 'c', 'd')
    const remainingQuestions = q('c', 'd')

    const result = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions,
      remainingQuestions,
      currentQuestion: one('b'),
    })

    expect(result.forgottenQuestions).toEqual([])
    expect(result.relevantQuestions).toEqual(relevantQuestions)
    expect(result.remainingQuestions).toEqual(remainingQuestions)
  })

  it('moves the still missing questions placed before the current one at the end', () => {
    // "b" is missing while the user is already on "c" (placed after it).
    const result = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c', 'd'),
      remainingQuestions: q('b', 'd'),
      currentQuestion: one('c'),
    })

    expect(result.forgottenQuestions).toEqual(q('b'))
    expect(result.relevantQuestions).toEqual(q('a', 'c', 'd', 'b'))
    expect(result.remainingQuestions).toEqual(q('d', 'b'))
  })

  it('does not move the questions opened right after going back', () => {
    // The user went back to "b" (already answered) and answered it again, which
    // opened "c": it must be asked right after "b", not at the end.
    const result = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c', 'd'),
      remainingQuestions: q('c', 'd'),
      currentQuestion: one('b'),
    })

    expect(result.forgottenQuestions).toEqual([])
    expect(result.relevantQuestions).toEqual(q('a', 'b', 'c', 'd'))
    expect(result.remainingQuestions).toEqual(q('c', 'd'))
  })

  it('keeps a forgotten question at the end once it has been answered', () => {
    // "b" was forgotten, asked at the end and is now answered: it is no longer
    // missing but it must stay at the end instead of bouncing back to the middle
    // of the form.
    const result = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c'),
      remainingQuestions: q(),
      currentQuestion: one('c'),
      previousForgottenQuestions: q('b'),
    })

    expect(result.forgottenQuestions).toEqual(q('b'))
    expect(result.relevantQuestions).toEqual(q('a', 'c', 'b'))
    expect(result.remainingQuestions).toEqual([])
  })

  it('asks the remaining questions after the current forgotten question', () => {
    // The user is on "b", which has been forgotten and moved at the end: every
    // remaining question must be asked after it, otherwise "next" would skip
    // them.
    const result = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c', 'd'),
      remainingQuestions: q('c', 'd'),
      currentQuestion: one('b'),
      previousForgottenQuestions: q('b'),
    })

    expect(result.forgottenQuestions).toEqual(q('b'))
    expect(result.relevantQuestions).toEqual(q('a', 'b', 'c', 'd'))
    expect(result.remainingQuestions).toEqual(q('c', 'd'))
  })

  it('asks a forgotten question again in the base order when going back before it', () => {
    const result = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c'),
      remainingQuestions: q('b'),
      currentQuestion: one('a'),
      previousForgottenQuestions: q('b'),
    })

    expect(result.forgottenQuestions).toEqual([])
    expect(result.relevantQuestions).toEqual(q('a', 'b', 'c'))
    expect(result.remainingQuestions).toEqual(q('b'))
  })
})
