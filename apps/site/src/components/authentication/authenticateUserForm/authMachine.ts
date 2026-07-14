import type { PendingVerification } from '@/components/authentication/authenticateUserForm/_hooks/usePendingVerification'

export type AuthPhase =
  | { phase: 'idle' }
  | { phase: 'email_sending'; email: string }
  | {
      phase: 'code_sent'
      email: string
      pendingVerification: PendingVerification
    }
  | {
      phase: 'resending_code'
      email: string
      pendingVerification: PendingVerification
    }
  | {
      phase: 'verifying_code'
      email: string
      code: string
      pendingVerification: PendingVerification
    }
  | { phase: 'authenticated'; email: string; userId: string }
  | { phase: 'redirecting'; email: string; userId: string }

export type AuthEvent =
  | { type: 'SUBMIT_EMAIL'; email: string }
  | { type: 'EMAIL_SENT'; pendingVerification: PendingVerification }
  | { type: 'EMAIL_ERROR' }
  | { type: 'SUBMIT_CODE'; code: string }
  | { type: 'CODE_VALID'; userId: string }
  | { type: 'CODE_INVALID' }
  | { type: 'RESEND_CODE' }
  | { type: 'CODE_RESENT'; pendingVerification: PendingVerification }
  | { type: 'CODE_RESEND_ERROR' }
  | { type: 'GO_BACK' }
  | { type: 'FINALIZE' }
  | { type: 'RESET' }

export const initialAuthPhase: AuthPhase = { phase: 'idle' }

export function authReducer(state: AuthPhase, event: AuthEvent): AuthPhase {
  // Global event that resets from any phase
  if (event.type === 'RESET') {
    return { phase: 'idle' }
  }

  switch (state.phase) {
    case 'idle':
      switch (event.type) {
        case 'SUBMIT_EMAIL':
          return { phase: 'email_sending', email: event.email }
        case 'EMAIL_SENT':
          return {
            phase: 'code_sent',
            email: event.pendingVerification.email,
            pendingVerification: event.pendingVerification,
          }
        default:
          return state
      }

    case 'email_sending':
      switch (event.type) {
        case 'EMAIL_SENT':
          return {
            phase: 'code_sent',
            email: state.email,
            pendingVerification: event.pendingVerification,
          }
        case 'EMAIL_ERROR':
          return { phase: 'idle' }
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
            pendingVerification: state.pendingVerification,
          }
        case 'RESEND_CODE':
          return {
            phase: 'resending_code',
            email: state.email,
            pendingVerification: state.pendingVerification,
          }
        case 'GO_BACK':
          return { phase: 'idle' }
        case 'EMAIL_SENT':
          return {
            phase: 'code_sent',
            email: state.email,
            pendingVerification: event.pendingVerification,
          }
        default:
          return state
      }

    case 'resending_code':
      switch (event.type) {
        case 'CODE_RESENT':
        case 'EMAIL_SENT':
          return {
            phase: 'code_sent',
            email: state.email,
            pendingVerification: event.pendingVerification,
          }
        case 'CODE_RESEND_ERROR':
          return {
            phase: 'code_sent',
            email: state.email,
            pendingVerification: state.pendingVerification,
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
            pendingVerification: state.pendingVerification,
          }
        default:
          return state
      }

    case 'authenticated':
      switch (event.type) {
        case 'FINALIZE':
          return {
            phase: 'redirecting',
            email: state.email,
            userId: state.userId,
          }
        default:
          return state
      }

    case 'redirecting':
      return state
  }
}
