import getQuestionsWithForgottenAtTheEnd from '@/publicodes-state/helpers/getQuestionsWithForgottenAtTheEnd'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { describe, expect, it } from 'vitest'

const q = (...names: string[]) => names as DottedName[]

describe('getQuestionsWithForgottenAtTheEnd', () => {
  it('returns the lists as is when there is no forgotten question', () => {
    const relevantQuestions = q('a', 'b', 'c', 'd')
    const remainingQuestions = q('c', 'd')

    const result = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions,
      remainingQuestions,
      relevantAnsweredQuestions: q('a', 'b'),
    })

    expect(result.forgottenQuestions).toEqual([])
    expect(result.relevantQuestions).toEqual(relevantQuestions)
    expect(result.remainingQuestions).toEqual(remainingQuestions)
  })

  it('moves the still missing questions placed before the last answered one at the end', () => {
    // "b" is missing while "c" (placed after it) has already been answered.
    const result = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c', 'd'),
      remainingQuestions: q('b', 'd'),
      relevantAnsweredQuestions: q('a', 'c'),
    })

    expect(result.forgottenQuestions).toEqual(q('b'))
    expect(result.relevantQuestions).toEqual(q('a', 'c', 'd', 'b'))
    expect(result.remainingQuestions).toEqual(q('d', 'b'))
  })

  it('keeps the relative order of the forgotten questions', () => {
    const result = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c', 'd', 'e'),
      remainingQuestions: q('a', 'c', 'e'),
      relevantAnsweredQuestions: q('b', 'd'),
    })

    expect(result.forgottenQuestions).toEqual(q('a', 'c'))
    expect(result.relevantQuestions).toEqual(q('b', 'd', 'e', 'a', 'c'))
    expect(result.remainingQuestions).toEqual(q('e', 'a', 'c'))
  })

  it('does not consider answered questions as forgotten', () => {
    const result = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c'),
      remainingQuestions: q('c'),
      relevantAnsweredQuestions: q('a', 'b'),
    })

    expect(result.forgottenQuestions).toEqual([])
  })

  it('keeps a forgotten question at the end once it has been answered', () => {
    // "b" was forgotten, asked at the end and is now answered: it is no longer
    // missing but it must stay at the end instead of bouncing back to the middle
    // of the form.
    const result = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c'),
      remainingQuestions: q(),
      relevantAnsweredQuestions: q('a', 'c', 'b'),
    })

    expect(result.forgottenQuestions).toEqual(q('b'))
    expect(result.relevantQuestions).toEqual(q('a', 'c', 'b'))
    expect(result.remainingQuestions).toEqual([])
  })

  it('does not flag anything when the questions are answered in the base order', () => {
    const result = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c', 'd'),
      remainingQuestions: q('c', 'd'),
      relevantAnsweredQuestions: q('a', 'b'),
    })

    expect(result.forgottenQuestions).toEqual([])
    expect(result.relevantQuestions).toEqual(q('a', 'b', 'c', 'd'))
  })

  it('is stable: the detection relies on the base order, not on the reordered one', () => {
    // The base order is recomputed from scratch on every render (it comes from
    // the publicodes sort), so the same input always yields the same result and
    // "b" can not bounce back to the middle of the form.
    const relevantAnsweredQuestions = q('a', 'c')

    const firstResult = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c'),
      remainingQuestions: q('b'),
      relevantAnsweredQuestions,
    })

    expect(firstResult.forgottenQuestions).toEqual(q('b'))
    expect(firstResult.relevantQuestions).toEqual(q('a', 'c', 'b'))
    expect(firstResult.remainingQuestions).toEqual(q('b'))

    const secondResult = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c'),
      remainingQuestions: q('b'),
      relevantAnsweredQuestions,
    })

    expect(secondResult).toEqual(firstResult)
  })
})
