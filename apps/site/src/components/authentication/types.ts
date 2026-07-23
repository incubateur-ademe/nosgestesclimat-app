import type { CodeError, EmailError } from '@/types/auth-errors'
import type { PosthogEvent } from '@/utils/analytics/trackEvent'

export type { CodeError, EmailError }

export interface PendingVerification {
  expirationDate: Date
  email: string
}

export type AuthPhase =
  | { phase: 'idle'; emailError: EmailError | null }
  | { phase: 'email_sending'; email: string }
  | {
      phase: 'code_sent'
      email: string
      pending: PendingVerification
      cooldownUntil: number
      isResending: boolean
      codeError: CodeError | null
      resendError: EmailError | null
    }
  | {
      phase: 'verifying_code'
      email: string
      code: string
      pending: PendingVerification
      cooldownUntil: number
    }
  | { phase: 'authenticated'; email: string; userId: string }

export type AuthEvent =
  | { type: 'SUBMIT_EMAIL'; email: string }
  | {
      type: 'EMAIL_SENT'
      pending: PendingVerification
      cooldownUntil: number
    }
  | { type: 'EMAIL_ERROR'; reason: EmailError; cooldownUntil?: number }
  | { type: 'SUBMIT_CODE'; code: string }
  | { type: 'CODE_VALID'; userId: string }
  | { type: 'CODE_INVALID'; reason: CodeError }
  | { type: 'RESEND_CODE' }
  | {
      type: 'CODE_RESENT'
      pending: PendingVerification
      cooldownUntil: number
    }
  | {
      type: 'CODE_RESEND_ERROR'
      reason: EmailError
      cooldownUntil?: number
    }
  | { type: 'GO_BACK' }
  | { type: 'RESET' }
  | { type: 'CLEAR_CODE_ERROR' }
  | { type: 'HYDRATE'; phase: AuthPhase }

export interface AuthenticatedUser {
  email: string
  userId: string
}

export type Tracker = PosthogEvent

export type VerifyStrategy = (
  email: string,
  code: string
) => Promise<{ userId: string }>
