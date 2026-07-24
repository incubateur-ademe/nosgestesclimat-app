import { matchError } from './errors'
import type { AuthEvent, AuthPhase } from './types'

export const initialAuthPhase: AuthPhase = { phase: 'idle', emailError: null }

export function authReducer(state: AuthPhase, event: AuthEvent): AuthPhase {
  if (event.type === 'HYDRATE') return event.phase
  if (event.type === 'RESET') {
    return { phase: 'idle', emailError: null }
  }

  switch (state.phase) {
    case 'idle':
      switch (event.type) {
        case 'SUBMIT_EMAIL':
          return { phase: 'email_sending', email: event.email }
        default:
          return state
      }

    case 'email_sending':
      switch (event.type) {
        case 'EMAIL_SENT':
          return {
            phase: 'code_sent',
            email: state.email,
            pending: event.pending,
            cooldownUntil: event.cooldownUntil,
            isResending: false,
            codeError: null,
            resendError: null,
          }
        case 'EMAIL_ERROR':
          return {
            phase: 'idle',
            emailError: event.reason,
          }
        case 'GO_BACK':
          return { phase: 'idle', emailError: null }
        default:
          return state
      }

    case 'code_sent':
      switch (event.type) {
        case 'SUBMIT_CODE':
          return {
            phase: 'verifying_code',
            email: state.email,
            code: event.code,
            pending: state.pending,
            cooldownUntil: state.cooldownUntil,
          }
        case 'RESEND_CODE':
          return {
            ...state,
            isResending: true,
            resendError: null,
          }
        case 'CODE_RESENT':
          return {
            ...state,
            isResending: false,
            pending: event.pending,
            cooldownUntil: event.cooldownUntil,
            resendError: null,
          }
        case 'CODE_RESEND_ERROR':
          return {
            ...state,
            isResending: false,
            resendError: event.reason,
            cooldownUntil: matchError(event.reason, {
              rate_limited: () =>
                event.cooldownUntil != null
                  ? event.cooldownUntil
                  : state.cooldownUntil,
              unknown: () => state.cooldownUntil,
            }),
          }
        case 'GO_BACK':
          return { phase: 'idle', emailError: null }
        case 'CLEAR_CODE_ERROR':
          if (state.codeError === null) return state
          return { ...state, codeError: null }
        case 'EMAIL_SENT':
          return {
            ...state,
            pending: event.pending,
            cooldownUntil: event.cooldownUntil,
            resendError: null,
          }
        default:
          return state
      }

    case 'verifying_code':
      switch (event.type) {
        case 'CODE_VALID':
          return {
            phase: 'authenticated',
            email: state.email,
            userId: event.userId,
          }
        case 'CODE_INVALID':
          return {
            phase: 'code_sent',
            email: state.email,
            pending: state.pending,
            cooldownUntil: state.cooldownUntil,
            isResending: false,
            codeError: event.reason,
            resendError: null,
          }
        default:
          return state
      }

    case 'authenticated':
      return state
  }
}
