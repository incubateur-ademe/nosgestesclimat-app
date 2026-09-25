import { captureException } from '@sentry/nextjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  RateLimitedError,
  UnknownCodeError,
} from '@/components/authentication/errors'
import { createVerificationCode } from '../create-verification-code'

const serviceMock = vi.hoisted(() => ({
  createVerificationCode: vi.fn(),
}))

vi.mock('@/adapters/brevoClient', () => ({
  sendEmail: vi.fn(),
}))

vi.mock('@/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

vi.mock(
  '@nosgestesclimat/core/features/auth/services/create-verification-code.service',
  () => ({
    createVerificationCodeService: vi.fn(
      () => serviceMock.createVerificationCode
    ),
  })
)

vi.mock('next/server', () => ({
  after: vi.fn(),
}))

// The real in-memory rate limiter is used on purpose: its map persists across
// the tests of this file, so every test uses a distinct email.
describe('createVerificationCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    serviceMock.createVerificationCode.mockResolvedValue({
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
    expect(serviceMock.createVerificationCode).toHaveBeenCalledWith({
      email: 'success@example.com',
      locale: 'fr',
    })
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
    expect(serviceMock.createVerificationCode).toHaveBeenCalledTimes(1)
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
    expect(serviceMock.createVerificationCode).toHaveBeenCalledTimes(1)
    expect(serviceMock.createVerificationCode).toHaveBeenCalledWith({
      email: 'case@example.com',
      locale: 'fr',
    })
  })

  it('defaults a missing locale to fr', async () => {
    await createVerificationCode({ email: 'default-locale@example.com' })

    expect(serviceMock.createVerificationCode).toHaveBeenCalledWith({
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
    expect(serviceMock.createVerificationCode).not.toHaveBeenCalled()
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
    expect(serviceMock.createVerificationCode).not.toHaveBeenCalled()
  })

  it('maps a service failure to the unknown error and captures it', async () => {
    serviceMock.createVerificationCode.mockRejectedValue(new Error('boom'))

    const result = await createVerificationCode({
      email: 'throwing@example.com',
      locale: 'fr',
    })

    expect(result).toEqual({
      success: false,
      error: new UnknownCodeError(),
    })
    expect(captureException).toHaveBeenCalledWith(expect.any(Error))
  })

  it('ignores the deprecated mode parameter', async () => {
    const result = await createVerificationCode({
      email: 'with-mode@example.com',
      mode: 'signUp',
      locale: 'fr',
    })

    expect(result.success).toBe(true)
    expect(serviceMock.createVerificationCode).toHaveBeenCalledWith({
      email: 'with-mode@example.com',
      locale: 'fr',
    })
  })
})
