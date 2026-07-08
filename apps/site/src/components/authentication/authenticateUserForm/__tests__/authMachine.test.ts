import { describe, expect, it } from 'vitest'
import { authReducer, type AuthEvent, type AuthPhase } from '../authMachine'

describe('authReducer', () => {
  describe('global RESET event', () => {
    it.each([
      { phase: 'idle' } as AuthPhase,
      { phase: 'email_sending', email: 'a@b.com' } as AuthPhase,
      {
        phase: 'code_sent',
        email: 'a@b.com',
        pendingVerification: {
          email: 'a@b.com',
          expirationDate: new Date(),
        },
      } as AuthPhase,
      {
        phase: 'resending_code',
        email: 'a@b.com',
        pendingVerification: {
          email: 'a@b.com',
          expirationDate: new Date(),
        },
      } as AuthPhase,
      {
        phase: 'verifying_code',
        email: 'a@b.com',
        pendingVerification: {
          email: 'a@b.com',
          expirationDate: new Date(),
        },
      } as AuthPhase,
      { phase: 'authenticated', email: 'a@b.com', userId: 'u1' } as AuthPhase,
      { phase: 'redirecting', email: 'a@b.com', userId: 'u1' } as AuthPhase,
    ])('returns idle from any state when RESET is dispatched', (state) => {
      const result = authReducer(state, { type: 'RESET' })
      expect(result).toEqual({ phase: 'idle' })
    })
  })

  describe('phase: idle', () => {
    const state: AuthPhase = { phase: 'idle' }

    it('transitions to email_sending on SUBMIT_EMAIL', () => {
      const result = authReducer(state, {
        type: 'SUBMIT_EMAIL',
        email: 'user@example.com',
      })
      expect(result).toEqual({
        phase: 'email_sending',
        email: 'user@example.com',
      })
    })

    it('transitions to code_sent on EMAIL_SENT', () => {
      const pendingVerification = {
        email: 'user@example.com',
        expirationDate: new Date('2025-01-01'),
      }
      const result = authReducer(state, {
        type: 'EMAIL_SENT',
        pendingVerification,
      })
      expect(result).toEqual({
        phase: 'code_sent',
        email: 'user@example.com',
        pendingVerification,
      })
    })

    it('ignores unhandled events and stays idle', () => {
      const result = authReducer(state, {
        type: 'CODE_VALID',
        userId: 'u1',
      })
      expect(result).toEqual({ phase: 'idle' })
    })
  })

  describe('phase: email_sending', () => {
    const state: AuthPhase = {
      phase: 'email_sending',
      email: 'user@example.com',
    }

    it('transitions to code_sent on EMAIL_SENT', () => {
      const pendingVerification = {
        email: 'user@example.com',
        expirationDate: new Date('2025-01-01'),
      }
      const result = authReducer(state, {
        type: 'EMAIL_SENT',
        pendingVerification,
      })
      expect(result).toEqual({
        phase: 'code_sent',
        email: 'user@example.com',
        pendingVerification,
      })
    })

    it('returns to idle on EMAIL_ERROR', () => {
      const result = authReducer(state, { type: 'EMAIL_ERROR' })
      expect(result).toEqual({ phase: 'idle' })
    })

    it('ignores unhandled events and stays in email_sending', () => {
      const result = authReducer(state, { type: 'GO_BACK' })
      expect(result).toEqual(state)
    })
  })

  describe('phase: code_sent', () => {
    const pendingVerification = {
      email: 'user@example.com',
      expirationDate: new Date('2025-01-01'),
    }
    const state: AuthPhase = {
      phase: 'code_sent',
      email: 'user@example.com',
      pendingVerification,
    }

    it('transitions to verifying_code on SUBMIT_CODE', () => {
      const result = authReducer(state, {
        type: 'SUBMIT_CODE',
        code: '123456',
      })
      expect(result).toEqual({
        phase: 'verifying_code',
        email: 'user@example.com',
        pendingVerification,
      })
    })

    it('transitions to resending_code on RESEND_CODE', () => {
      const result = authReducer(state, { type: 'RESEND_CODE' })
      expect(result).toEqual({
        phase: 'resending_code',
        email: 'user@example.com',
        pendingVerification,
      })
    })

    it('returns to idle on GO_BACK', () => {
      const result = authReducer(state, { type: 'GO_BACK' })
      expect(result).toEqual({ phase: 'idle' })
    })

    it('updates pendingVerification on EMAIL_SENT', () => {
      const newPendingVerification = {
        email: 'user@example.com',
        expirationDate: new Date('2025-12-31'),
      }
      const result = authReducer(state, {
        type: 'EMAIL_SENT',
        pendingVerification: newPendingVerification,
      })
      expect(result).toEqual({
        phase: 'code_sent',
        email: 'user@example.com',
        pendingVerification: newPendingVerification,
      })
    })

    it('ignores unhandled events and stays in code_sent', () => {
      const result = authReducer(state, {
        type: 'CODE_VALID',
        userId: 'u1',
      })
      expect(result).toEqual(state)
    })
  })

  describe('phase: resending_code', () => {
    const pendingVerification = {
      email: 'user@example.com',
      expirationDate: new Date('2025-01-01'),
    }
    const state: AuthPhase = {
      phase: 'resending_code',
      email: 'user@example.com',
      pendingVerification,
    }

    it('returns to code_sent on CODE_RESENT', () => {
      const newPendingVerification = {
        email: 'user@example.com',
        expirationDate: new Date('2025-12-31'),
      }
      const result = authReducer(state, {
        type: 'CODE_RESENT',
        pendingVerification: newPendingVerification,
      })
      expect(result).toEqual({
        phase: 'code_sent',
        email: 'user@example.com',
        pendingVerification: newPendingVerification,
      })
    })

    it('returns to code_sent on EMAIL_SENT', () => {
      const newPendingVerification = {
        email: 'user@example.com',
        expirationDate: new Date('2025-12-31'),
      }
      const result = authReducer(state, {
        type: 'EMAIL_SENT',
        pendingVerification: newPendingVerification,
      })
      expect(result).toEqual({
        phase: 'code_sent',
        email: 'user@example.com',
        pendingVerification: newPendingVerification,
      })
    })

    it('returns to code_sent on CODE_RESEND_ERROR', () => {
      const result = authReducer(state, { type: 'CODE_RESEND_ERROR' })
      expect(result).toEqual({
        phase: 'code_sent',
        email: 'user@example.com',
        pendingVerification,
      })
    })

    it('ignores unhandled events and stays in resending_code', () => {
      const result = authReducer(state, { type: 'GO_BACK' })
      expect(result).toEqual(state)
    })
  })

  describe('phase: verifying_code', () => {
    const pendingVerification = {
      email: 'user@example.com',
      expirationDate: new Date('2025-01-01'),
    }
    const state: AuthPhase = {
      phase: 'verifying_code',
      email: 'user@example.com',
      pendingVerification,
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

    it('returns to code_sent on CODE_INVALID', () => {
      const result = authReducer(state, { type: 'CODE_INVALID' })
      expect(result).toEqual({
        phase: 'code_sent',
        email: 'user@example.com',
        pendingVerification,
      })
    })

    it('ignores unhandled events and stays in verifying_code', () => {
      const result = authReducer(state, { type: 'GO_BACK' })
      expect(result).toEqual(state)
    })
  })

  describe('phase: authenticated', () => {
    const state: AuthPhase = {
      phase: 'authenticated',
      email: 'user@example.com',
      userId: 'user-123',
    }

    it('transitions to redirecting on FINALIZE', () => {
      const result = authReducer(state, { type: 'FINALIZE' })
      expect(result).toEqual({
        phase: 'redirecting',
        email: 'user@example.com',
        userId: 'user-123',
      })
    })

    it('ignores unhandled events and stays authenticated', () => {
      const result = authReducer(state, { type: 'SUBMIT_EMAIL', email: '' })
      expect(result).toEqual(state)
    })
  })

  describe('phase: redirecting', () => {
    const state: AuthPhase = {
      phase: 'redirecting',
      email: 'user@example.com',
      userId: 'user-123',
    }

    it('ignores all events and stays redirecting', () => {
      // RESET is handled globally in the reducer before the state switch,
      // so it transitions to idle from any state including redirecting.
      const nonResetEvents: AuthEvent[] = [
        { type: 'SUBMIT_EMAIL', email: '' },
        { type: 'EMAIL_SENT', pendingVerification: {} as any },
        { type: 'EMAIL_ERROR' },
        { type: 'SUBMIT_CODE', code: '' },
        { type: 'CODE_VALID', userId: '' },
        { type: 'CODE_INVALID' },
        { type: 'RESEND_CODE' },
        { type: 'CODE_RESENT', pendingVerification: {} as any },
        { type: 'CODE_RESEND_ERROR' },
        { type: 'GO_BACK' },
        { type: 'FINALIZE' },
      ]

      for (const event of nonResetEvents) {
        const result = authReducer(state, event)
        expect(result).toEqual(state)
      }
    })

    it('transitions to idle on RESET even from redirecting', () => {
      const result = authReducer(state, { type: 'RESET' })
      expect(result).toEqual({ phase: 'idle' })
    })
  })
})
