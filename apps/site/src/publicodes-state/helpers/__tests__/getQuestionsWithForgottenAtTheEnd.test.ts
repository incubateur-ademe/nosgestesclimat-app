import getQuestionsWithForgottenAtTheEnd from '@/publicodes-state/helpers/getQuestionsWithForgottenAtTheEnd'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { describe, expect, it } from 'vitest'

const q = (...names: string[]) => names as DottedName[]
const one = (name: string) => name as DottedName

describe('getQuestionsWithForgottenAtTheEnd', () => {
  it('does not detect questions before the last question', () => {
    const forgottenQuestions = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c', 'd'),
      remainingQuestions: q('b', 'd'),
      currentQuestion: one('c'),
    })

    expect(forgottenQuestions).toEqual([])
  })

  it('detects missing questions before the last question', () => {
    const forgottenQuestions = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c', 'd'),
      remainingQuestions: q('b'),
      currentQuestion: one('d'),
    })

    expect(forgottenQuestions).toEqual(q('b'))
  })

  it('does not detect questions opened after going back', () => {
    // The user went back to "b" and answered it again, opening "c". The
    // question is not forgotten because the form has not reached its last base
    // question yet.
    const forgottenQuestions = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c', 'd'),
      remainingQuestions: q('c', 'd'),
      currentQuestion: one('b'),
    })

    expect(forgottenQuestions).toEqual([])
  })

  it('does not detect anything when the last question is not known', () => {
    const forgottenQuestions = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b'),
      remainingQuestions: q('a'),
      currentQuestion: null,
    })

    expect(forgottenQuestions).toEqual([])
  })

  it('detects new questions opened by a forgotten question', () => {
    const forgottenQuestions = getQuestionsWithForgottenAtTheEnd({
      relevantQuestions: q('a', 'b', 'c', 'd'),
      remainingQuestions: q('c', 'd'),
      currentQuestion: one('b'),
      forgottenQuestions: q('b'),
    })

    expect(forgottenQuestions).toEqual(q('c', 'd'))
  })
})
