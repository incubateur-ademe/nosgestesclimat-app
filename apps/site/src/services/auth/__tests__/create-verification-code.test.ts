import {
  RateLimitedError,
  UnknownCodeError,
} from '@/components/authentication/errors'
import type * as loggerModule from '@/logger'
import { maskEmail } from '@/logger'
import { captureException } from '@sentry/nextjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createVerificationCode } from '../create-verification-code'

const mocks = vi.hoisted(() => ({
  createVerificationCode: vi.fn(),
  sendEmail: vi.fn(),
  after: vi.fn(),
  loggerInfo: vi.fn(),
  loggerError: vi.fn(),
}))

vi.mock('@/adapters/brevoClient', () => ({
  sendEmail: mocks.sendEmail,
}))

vi.mock('@/logger', async (importOriginal) => {
  const actual = await importOriginal<typeof loggerModule>()

  return {
    default: {
      info: mocks.loggerInfo,
      warn: vi.fn(),
      error: mocks.loggerError,
      debug: vi.fn(),
    },
    maskEmail: actual.maskEmail,
  }
})

vi.mock(
  '@nosgestesclimat/core/features/auth/services/create-verification-code.service',
  () => ({
    createVerificationCodeService: vi.fn(() => mocks.createVerificationCode),
  })
)

vi.mock('next/server', () => ({
  after: mocks.after,
}))

// The real in-memory rate limiter is used on purpose: its map persists across
// the tests of this file, so every test uses a distinct email.
describe('createVerificationCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.createVerificationCode.mockResolvedValue({
      email: 'rate-limit@example.com',
      expirationDate: new Date('2026-01-02T03:04:05.678Z'),
    })
  })

  it('returns the expiration date as an ISO string and lowercases the email', async () => {
    const result = await createVerificationCode({
      email: 'Success@Example.com',
      locale: 'fr',
    })

    expect(result).toEqual({
      success: true,
      data: { expirationDate: '2026-01-02T03:04:05.678Z' },
    })
    expect(mocks.createVerificationCode).toHaveBeenCalledWith({
      email: 'success@example.com',
      locale: 'fr',
    })
    expect(mocks.loggerInfo).toHaveBeenCalledWith(
      'VerificationCode created',
      expect.objectContaining({
        email: maskEmail('Success@Example.com'),
        locale: 'fr',
        expirationDate: new Date('2026-01-02T03:04:05.678Z'),
        durationMs: expect.any(Number),
      })
    )
  })

  it('throttles an immediate repeat for the same email', async () => {
    const first = await createVerificationCode({
      email: 'throttled@example.com',
      locale: 'fr',
    })
    const second = await createVerificationCode({
      email: 'throttled@example.com',
      locale: 'fr',
    })

    expect(first.success).toBe(true)
    expect(second).toEqual({
      success: false,
      error: new RateLimitedError(),
    })
    expect(mocks.createVerificationCode).toHaveBeenCalledTimes(1)
  })

  it('throttles a repeat of the same email with different casing', async () => {
    const first = await createVerificationCode({
      email: 'Case@Example.com',
      locale: 'fr',
    })
    const second = await createVerificationCode({
      email: 'case@example.com',
      locale: 'fr',
    })

    expect(first.success).toBe(true)
    expect(second).toEqual({
      success: false,
      error: new RateLimitedError(),
    })
    expect(mocks.createVerificationCode).toHaveBeenCalledTimes(1)
    expect(mocks.createVerificationCode).toHaveBeenCalledWith({
      email: 'case@example.com',
      locale: 'fr',
    })
  })

  it('defaults a missing locale to fr', async () => {
    await createVerificationCode({ email: 'default-locale@example.com' })

    expect(mocks.createVerificationCode).toHaveBeenCalledWith({
      email: 'default-locale@example.com',
      locale: 'fr',
    })
  })

  it('rejects an unsupported locale with the unknown error', async () => {
    const result = await createVerificationCode({
      email: 'bad-locale@example.com',
      locale: 'de',
    })

    expect(result).toEqual({
      success: false,
      error: new UnknownCodeError(),
    })
    expect(mocks.createVerificationCode).not.toHaveBeenCalled()
  })

  it('rejects an invalid email with the unknown error', async () => {
    const result = await createVerificationCode({
      email: 'not-an-email',
      locale: 'fr',
    })

    expect(result).toEqual({
      success: false,
      error: new UnknownCodeError(),
    })
    expect(mocks.createVerificationCode).not.toHaveBeenCalled()
  })

  it('maps a service failure to the unknown error and captures it', async () => {
    const failure = new Error('boom')
    mocks.createVerificationCode.mockRejectedValue(failure)

    const result = await createVerificationCode({
      email: 'throwing@example.com',
      locale: 'fr',
    })

    expect(result).toEqual({
      success: false,
      error: new UnknownCodeError(),
    })
    expect(mocks.loggerError).toHaveBeenCalledWith(
      'VerificationCode creation failed',
      expect.objectContaining({
        email: maskEmail('throwing@example.com'),
        durationMs: expect.any(Number),
        error: failure,
      })
    )
    expect(captureException).toHaveBeenCalledWith(failure, {
      extra: expect.objectContaining({
        email: maskEmail('throwing@example.com'),
      }),
    })
  })

  it('ignores the deprecated mode parameter', async () => {
    const result = await createVerificationCode({
      email: 'with-mode@example.com',
      mode: 'signUp',
      locale: 'fr',
    })

    expect(result.success).toBe(true)
    expect(mocks.createVerificationCode).toHaveBeenCalledWith({
      email: 'with-mode@example.com',
      locale: 'fr',
    })
  })
})
