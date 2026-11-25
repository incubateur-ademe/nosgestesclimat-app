'use client'

import FormControllerContext, {
  type FormControllerSession,
} from '@/form-controller/core/FormControllerContext'
import { useContext } from 'react'

/**
 * Internal: read the form controller session. The public windows compose it —
 * nothing outside `form-controller/` imports it. Returns an empty session
 * outside the provider (the simulator skeleton renders above it).
 */
export function useFormController(): FormControllerSession {
  return useContext(FormControllerContext)
}
