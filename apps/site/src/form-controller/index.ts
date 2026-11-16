/**
 * The form controller's public API. Everything else under `form-controller/`
 * is internal: import it only from within the folder (enforced by
 * `no-restricted-imports`).
 */
export { useDismissNotification } from '@/form-controller/behaviors/useDismissNotification'
export { default as FormControllerProvider } from '@/form-controller/core/FormControllerProvider'
export type { CustomQuestionRendererProps } from '@/form-controller/custom-questions/types'
export { useCustomQuestion } from '@/form-controller/custom-questions/useCustomQuestion'
export { useFormAdvancement } from '@/form-controller/useFormAdvancement'
export { useFormDebug } from '@/form-controller/useFormDebug'
export {
  useFormNavigation,
  type SubmitButtonKind,
} from '@/form-controller/useFormNavigation'
export {
  useFormQuestion,
  type FormQuestion,
} from '@/form-controller/useFormQuestion'
