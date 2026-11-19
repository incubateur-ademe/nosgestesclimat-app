'use client'

import { useFormController } from '@/form-controller/core/useFormController'
import { customQuestions } from './registry'
import { useCustomDerive } from './useCustomDerive'
import { useCustomDraft } from './useCustomDraft'

/**
 * The current question's custom question, if any: its renderer, the draft it
 * owns and the handler that persists and commits it. Returns null on a generic
 * question, so the caller falls back to `Question`.
 */
export function useCustomQuestion() {
  const { currentStep } = useFormController()
  const question =
    currentStep?.kind === 'question' ? currentStep.question : null

  const custom = question
    ? customQuestions.find((candidate) => candidate.match(question))
    : undefined

  const draft = useCustomDraft(custom, question)
  useCustomDerive(custom, question)

  if (!custom || !question) return null
  return {
    Renderer: custom.Renderer,
    question,
    draft: draft?.value,
    onChange: draft?.onChange,
  }
}
