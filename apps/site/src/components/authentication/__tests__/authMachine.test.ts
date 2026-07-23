import { describe, expect, it } from 'vitest'
import { authReducer } from '../authMachine'
import type { AuthEvent, AuthPhase } from '../types'

const pending = {
  email: 'user@example.com',
  expirationDate: new Date('2025-01-01'),
}
const cooldown = Date.now() + 30000

describe('authReducer', () => {
  describe('global RESET event', () => {
    it.each([
      { phase: 'idle', emailError: null } satisfies AuthPhase,
      { phase: 'email_sending', email: 'a@b.com' } satisfies AuthPhase,
      {
        phase: 'code_sent',
        email: 'a@b.com',
        pending,
        cooldownUntil: cooldown,
        isResending: false,
        codeError: null,
        resendError: null,
      } satisfies AuthPhase,
      {
        phase: 'verifying_code',
        email: 'a@b.com',
        code: '123456',
        pending,
        cooldownUntil: cooldown,
      } satisfies AuthPhase,
      { phase: 'authenticated', email: 'a@b.com', userId: 'u1' } as AuthPhase,
    ])('returns idle from any state when RESET is dispatched', (state) => {
      expect(authReducer(state, { type: 'RESET' })).toEqual({
        phase: 'idle',
        emailError: null,
      })
    })
  })

  describe('global HYDRATE event', () => {
    it('replaces the current state with the hydrated phase', () => {
      const current: AuthPhase = { phase: 'idle', emailError: null }
      const result = authReducer(current, {
        type: 'HYDRATE',
        phase: {
          phase: 'code_sent',
          email: 'a@b.com',
          pending,
          cooldownUntil: cooldown,
          isResending: false,
          codeError: null,
          resendError: null,
        },
      })
      expect(result.phase).toBe('code_sent')
    })

    it('replaces any state including authenticated', () => {
      const current: AuthPhase = {
        phase: 'authenticated',
        email: 'a@b.com',
        userId: 'u1',
      }
      const result = authReducer(current, {
        type: 'HYDRATE',
        phase: { phase: 'idle', emailError: null },
      })
      expect(result.phase).toBe('idle')
    })
  })

  describe('phase: idle', () => {
    const state: AuthPhase = { phase: 'idle', emailError: null }

    it('transitions to email_sending on SUBMIT_EMAIL', () => {
      expect(
        authReducer(state, { type: 'SUBMIT_EMAIL', email: 'user@example.com' })
      ).toEqual({ phase: 'email_sending', email: 'user@example.com' })
    })

    it('ignores all non-SUBMIT_EMAIL events and stays idle', () => {
      const ignoredEvents: AuthEvent[] = [
        { type: 'EMAIL_SENT', pending, cooldownUntil: cooldown },
        { type: 'EMAIL_ERROR', reason: { _tag: 'unknown' } },
        { type: 'CODE_VALID', userId: 'u1' },
        { type: 'CODE_INVALID', reason: { _tag: 'invalid' } },
        { type: 'RESEND_CODE' },
        { type: 'CODE_RESENT', pending, cooldownUntil: cooldown },
        { type: 'CODE_RESEND_ERROR', reason: { _tag: 'unknown' } },
        { type: 'GO_BACK' },
        { type: 'CLEAR_CODE_ERROR' },
      ]
      for (const event of ignoredEvents) {
        expect(authReducer(state, event)).toEqual(state)
      }
    })
  })

  describe('phase: email_sending', () => {
    const state: AuthPhase = {
      phase: 'email_sending',
      email: 'user@example.com',
    }

    it('transitions to code_sent on EMAIL_SENT', () => {
      const result = authReducer(state, {
        type: 'EMAIL_SENT',
        pending,
        cooldownUntil: cooldown,
      })
      expect(result).toEqual({
        phase: 'code_sent',
        email: 'user@example.com',
        pending,
        cooldownUntil: cooldown,
        isResending: false,
        codeError: null,
        resendError: null,
      })
    })

    it('returns to idle on EMAIL_ERROR', () => {
      const result = authReducer(state, {
        type: 'EMAIL_ERROR',
        reason: { _tag: 'rate_limited' },
      })
      expect(result).toEqual({
        phase: 'idle',
        emailError: { _tag: 'rate_limited' },
      })
    })

    it('returns to idle on GO_BACK', () => {
      const result = authReducer(state, { type: 'GO_BACK' })
      expect(result).toEqual({ phase: 'idle', emailError: null })
    })

    it('ignores unhandled events and stays in email_sending', () => {
      expect(authReducer(state, { type: 'CODE_VALID', userId: 'u1' })).toEqual(
        state
      )
    })
  })

  describe('phase: code_sent', () => {
    const state: AuthPhase = {
      phase: 'code_sent',
      email: 'user@example.com',
      pending,
      cooldownUntil: cooldown,
      isResending: false,
      codeError: null,
      resendError: null,
    }

    it('transitions to verifying_code on SUBMIT_CODE', () => {
      const result = authReducer(state, {
        type: 'SUBMIT_CODE',
        code: '123456',
      })
      expect(result).toEqual({
        phase: 'verifying_code',
        email: 'user@example.com',
        code: '123456',
        pending,
        cooldownUntil: cooldown,
      })
    })

    it('sets isResending on RESEND_CODE and clears resendError', () => {
      const withError = {
        ...state,
        resendError: { _tag: 'unknown' } as const,
        codeError: { _tag: 'invalid' } as const,
      }
      const result = authReducer(withError, { type: 'RESEND_CODE' })
      expect((result as typeof withError).isResending).toBe(true)
      expect((result as typeof withError).resendError).toBeNull()
      expect((result as typeof withError).codeError).toEqual({
        _tag: 'invalid',
      })
    })

    it('returns to code_sent with new pending on CODE_RESENT', () => {
      const resending = { ...state, isResending: true }
      const newPending = {
        email: 'user@example.com',
        expirationDate: new Date('2025-12-31'),
      }
      const newCooldown = Date.now() + 30000
      const result = authReducer(resending, {
        type: 'CODE_RESENT',
        pending: newPending,
        cooldownUntil: newCooldown,
      })
      expect(result).toEqual({
        ...state,
        isResending: false,
        pending: newPending,
        cooldownUntil: newCooldown,
        resendError: null,
      })
    })

    it('sets resendError on CODE_RESEND_ERROR', () => {
      const resending = { ...state, isResending: true }
      const result = authReducer(resending, {
        type: 'CODE_RESEND_ERROR',
        reason: { _tag: 'rate_limited' },
      })
      expect((result as typeof resending).isResending).toBe(false)
      expect((result as typeof resending).resendError).toEqual({
        _tag: 'rate_limited',
      })
    })

    it('re-arms cooldown on CODE_RESEND_ERROR with rate_limited', () => {
      const resending = { ...state, isResending: true }
      const newCooldown = Date.now() + 30000
      const result = authReducer(resending, {
        type: 'CODE_RESEND_ERROR',
        reason: { _tag: 'rate_limited' },
        cooldownUntil: newCooldown,
      })
      expect((result as typeof resending).cooldownUntil).toBe(newCooldown)
    })

    it('clears codeError on CLEAR_CODE_ERROR', () => {
      const withError = { ...state, codeError: { _tag: 'invalid' } as const }
      const result = authReducer(withError, { type: 'CLEAR_CODE_ERROR' })
      expect((result as typeof withError).codeError).toBeNull()
    })

    it('returns to idle on GO_BACK', () => {
      const result = authReducer(state, { type: 'GO_BACK' })
      expect(result).toEqual({ phase: 'idle', emailError: null })
    })

    it('updates pending on EMAIL_SENT', () => {
      const newPending = {
        email: 'user@example.com',
        expirationDate: new Date('2025-12-31'),
      }
      const result = authReducer(state, {
        type: 'EMAIL_SENT',
        pending: newPending,
        cooldownUntil: cooldown,
      })
      expect((result as typeof state).pending).toEqual(newPending)
    })

    it('ignores unhandled events and stays in code_sent', () => {
      expect(authReducer(state, { type: 'CODE_VALID', userId: 'u1' })).toEqual(
        state
      )
    })
  })

  describe('phase: verifying_code', () => {
    const state: AuthPhase = {
      phase: 'verifying_code',
      email: 'user@example.com',
      code: '123456',
      pending,
      cooldownUntil: cooldown,
    }

    it('transitions to authenticated on CODE_VALID', () => {
      const result = authReducer(state, {
        type: 'CODE_VALID',
        userId: 'user-123',
      })
      expect(result).toEqual({
        phase: 'authenticated',
        email: 'user@example.com',
        userId: 'user-123',
      })
    })

    it('returns to code_sent with codeError on CODE_INVALID', () => {
      const result = authReducer(state, {
        type: 'CODE_INVALID',
        reason: { _tag: 'invalid' },
      })
      expect(result).toEqual({
        phase: 'code_sent',
        email: 'user@example.com',
        pending,
        cooldownUntil: cooldown,
        isResending: false,
        codeError: { _tag: 'invalid' },
        resendError: null,
      })
    })

    it('ignores SUBMIT_CODE while already verifying', () => {
      const result = authReducer(state, {
        type: 'SUBMIT_CODE',
        code: '654321',
      })
      expect(result).toEqual(state)
    })

    it('ignores unhandled events and stays in verifying_code', () => {
      expect(authReducer(state, { type: 'GO_BACK' })).toEqual(state)
    })
  })

  describe('phase: authenticated', () => {
    const state: AuthPhase = {
      phase: 'authenticated',
      email: 'user@example.com',
      userId: 'user-123',
    }

    it('ignores all events and stays authenticated', () => {
      expect(authReducer(state, { type: 'SUBMIT_EMAIL', email: '' })).toEqual(
        state
      )
      expect(authReducer(state, { type: 'RESEND_CODE' })).toEqual(state)
      expect(
        authReducer(state, {
          type: 'EMAIL_SENT',
          pending,
          cooldownUntil: cooldown,
        })
      ).toEqual(state)
    })
  })
})
