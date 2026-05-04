'use client'

import { useEngine } from '@/publicodes-state'
import { useMemo } from 'react'
import Question from './questions/Question'

export default function Questions() {
  const { getCategory, categories, everyQuestions } = useEngine()

  const orderedQuestions = useMemo(
    () =>
      everyQuestions.sort(
        (a, b) =>
          categories.indexOf(getCategory(a)) -
          categories.indexOf(getCategory(b))
      ),
    [everyQuestions, categories, getCategory]
  )

  return (
    <ul role="list">
      {orderedQuestions.map((question) => (
        <Question key={question} question={question} />
      ))}
    </ul>
  )
}
