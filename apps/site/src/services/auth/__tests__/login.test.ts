import {
  InvalidCodeError,
  RateLimitedError,
  UnknownCodeError,
} from '@/components/authentication/errors'
import type * as loggerModule from '@/logger'
import { InvalidVerificationCodeError } from '@nosgestesclimat/core/features/auth/errors/login.error'
import { failure, success } from '@nosgestesclimat/core/lib/result'
import { captureException } from '@sentry/nextjs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { login } from '../login'

const mocks = vi.hoisted(() => ({
  getUserSession: vi.fn(),
  createAppSession: vi.fn(),
  revokeAllSessions: vi.fn(),
  revalidatePath: vi.fn(),
  after: vi.fn(),
  rateLimitSameRequest: vi.fn(),
  sendEmail: vi.fn(),
  addOrUpdateContact: vi.fn(),
  sendWelcomeEmail: vi.fn(),
  addOrUpdateContactAfterLogin: vi.fn(),
  loginService: vi.fn(),
  loggerInfo: vi.fn(),
}))

vi.mock('../get-user-session', () => ({
  getUserSession: mocks.getUserSession,
}))

vi.mock('../create-app-session', () => ({
  createAppSession: mocks.createAppSession,
}))

vi.mock(
  '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service',
  () => ({ revokeAllSessions: mocks.revokeAllSessions })
)

vi.mock('@nosgestesclimat/core/features/auth/services/login.service', () => ({
  createLogin: () => mocks.loginService,
}))

vi.mock('@nosgestesclimat/core/features/auth/emails/auth-emails', () => ({
  createSendWelcomeEmail: () => mocks.sendWelcomeEmail,
  createAddOrUpdateContactAfterLogin: () => mocks.addOrUpdateContactAfterLogin,
}))

vi.mock('@/adapters/brevoClient', () => ({
  sendEmail: mocks.sendEmail,
  addOrUpdateContact: mocks.addOrUpdateContact,
}))

vi.mock('@/helpers/server/rateLimitSameRequest', () => ({
  rateLimitSameRequest: mocks.rateLimitSameRequest,
}))

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

vi.mock('next/server', () => ({ after: mocks.after }))

vi.mock('@/env.server', () => ({
  env: { NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' },
}))

vi.mock('@/logger', async (importOriginal) => {
  const actual = await importOriginal<typeof loggerModule>()

  return {
    default: {
      info: mocks.loggerInfo,
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    },
    maskEmail: actual.maskEmail,
  }
})

const sessionUserId = crypto.randomUUID()

const verifiedUser = {
  id: crypto.randomUUID(),
  name: null,
  email: 'user@example.com',
  position: null,
  telephone: null,
  optedInForCommunications: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe('login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.rateLimitSameRequest.mockReturnValue(true)
    mocks.getUserSession.mockResolvedValue({
      id: sessionUserId,
      isAuth: false,
    })
  })

  it('returns RateLimitedError and never reaches the service when throttled', async () => {
    mocks.rateLimitSameRequest.mockReturnValue(false)

    const result = await login({ email: 'user@example.com', code: '123456' })

    expect(result).toEqual(failure(new RateLimitedError()))
    expect(mocks.rateLimitSameRequest).toHaveBeenCalledWith({
      key: 'login:user@example.com',
      ttlMs: 30_000,
    })
    expect(mocks.loginService).not.toHaveBeenCalled()
  })

  it('throttles a repeat of the same email with different casing', async () => {
    const throttledKeys = new Set<string>()
    mocks.rateLimitSameRequest.mockImplementation(
      ({ key }: { key: string }) => {
        if (throttledKeys.has(key)) {
          return false
        }
        throttledKeys.add(key)

        return true
      }
    )
    mocks.loginService.mockResolvedValue(
      failure(new InvalidVerificationCodeError())
    )

    const first = await login({ email: 'Case@Example.com', code: '123456' })
    const second = await login({ email: 'case@example.com', code: '123456' })

    expect(first).toEqual(failure(new InvalidCodeError()))
    expect(second).toEqual(failure(new RateLimitedError()))
    expect(mocks.rateLimitSameRequest).toHaveBeenNthCalledWith(1, {
      key: 'login:case@example.com',
      ttlMs: 30_000,
    })
    expect(mocks.rateLimitSameRequest).toHaveBeenNthCalledWith(2, {
      key: 'login:case@example.com',
      ttlMs: 30_000,
    })
    expect(mocks.loginService).toHaveBeenCalledTimes(1)
  })

  it('returns UnknownCodeError on a malformed code', async () => {
    const result = await login({ email: 'user@example.com', code: '12ab' })

    expect(result).toEqual(failure(new UnknownCodeError()))
    expect(mocks.loginService).not.toHaveBeenCalled()
  })

  it('returns UnknownCodeError on an unsupported locale', async () => {
    const result = await login({
      email: 'user@example.com',
      code: '123456',
      locale: 'de',
    })

    expect(result).toEqual(failure(new UnknownCodeError()))
    expect(mocks.loginService).not.toHaveBeenCalled()
  })

  it('logs in through the core service and rotates the session', async () => {
    mocks.loginService.mockResolvedValue(
      success({ user: verifiedUser, mode: 'signUp' })
    )

    const result = await login({
      email: 'User@Example.com',
      code: '123456',
      locale: 'en',
    })

    expect(mocks.loginService).toHaveBeenCalledWith({
      loginDto: { email: 'user@example.com', code: '123456' },
      locale: 'en',
      sessionUserId,
    })
    expect(mocks.revokeAllSessions).toHaveBeenCalledWith(sessionUserId)
    expect(mocks.createAppSession).toHaveBeenCalledWith(
      verifiedUser.id,
      'User@Example.com'
    )
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/', 'layout')

    expect(result).toEqual(success({ userId: verifiedUser.id }))
  })

  it('creates a session without revoking anything when there is no prior session', async () => {
    mocks.getUserSession.mockResolvedValue(null)
    mocks.loginService.mockResolvedValue(
      success({ user: verifiedUser, mode: 'signIn' })
    )

    const result = await login({
      email: 'user@example.com',
      code: '123456',
      locale: 'en',
    })

    expect(mocks.loginService).toHaveBeenCalledWith({
      loginDto: { email: 'user@example.com', code: '123456' },
      locale: 'en',
      sessionUserId: undefined,
    })
    expect(mocks.revokeAllSessions).not.toHaveBeenCalled()
    expect(mocks.createAppSession).toHaveBeenCalledWith(
      verifiedUser.id,
      'user@example.com'
    )
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/', 'layout')

    expect(result).toEqual(success({ userId: verifiedUser.id }))
  })

  it('logs the login attempt and the success outcome', async () => {
    mocks.loginService.mockResolvedValue(
      success({ user: verifiedUser, mode: 'signIn' })
    )

    await login({
      email: 'user@example.com',
      code: '123456',
      locale: 'en',
    })

    expect(mocks.loggerInfo).toHaveBeenCalledWith('Login attempt', {
      userId: sessionUserId,
      email: 'us***@ex***',
      locale: 'en',
    })
    expect(mocks.loggerInfo).toHaveBeenCalledWith('Login succeeded', {
      userId: sessionUserId,
      email: 'us***@ex***',
      locale: 'en',
      mode: 'signIn',
      durationMs: expect.any(Number) as number,
    })
  })

  it('logs the validated email and the defaulted locale when none is passed', async () => {
    mocks.loginService.mockResolvedValue(
      success({ user: verifiedUser, mode: 'signIn' })
    )

    await login({ email: 'User@Example.com', code: '123456' })

    expect(mocks.loggerInfo).toHaveBeenCalledWith('Login attempt', {
      userId: sessionUserId,
      email: 'us***@ex***',
      locale: 'fr',
    })
  })

  it('maps the InvalidVerificationCodeError domain failure to InvalidCodeError', async () => {
    mocks.loginService.mockResolvedValue(
      failure(new InvalidVerificationCodeError())
    )

    const result = await login({ email: 'user@example.com', code: '000000' })

    expect(result).toEqual(failure(new InvalidCodeError()))
    expect(captureException).toHaveBeenCalledWith(
      expect.any(InvalidVerificationCodeError),
      {
        level: 'warning',
        extra: expect.objectContaining({
          email: 'us***@ex***',
          userId: sessionUserId,
        }) as Record<string, unknown>,
      }
    )
    expect(mocks.revokeAllSessions).not.toHaveBeenCalled()
    expect(mocks.createAppSession).not.toHaveBeenCalled()
  })

  it('maps an unexpected error to UnknownCodeError', async () => {
    mocks.loginService.mockRejectedValue(new Error('Prisma is down'))

    const result = await login({ email: 'user@example.com', code: '123456' })

    expect(result).toEqual(failure(new UnknownCodeError()))
    expect(captureException).toHaveBeenCalledWith(expect.any(Error), {
      extra: expect.objectContaining({
        email: 'us***@ex***',
      }) as Record<string, unknown>,
    })
    expect(mocks.createAppSession).not.toHaveBeenCalled()
  })

  it('collapses a getUserSession throw into a Result failure instead of rejecting the mutation', async () => {
    mocks.getUserSession.mockRejectedValue(new Error('session store down'))

    const result = await login({ email: 'user@example.com', code: '123456' })

    expect(result).toEqual(failure(new UnknownCodeError()))
    expect(mocks.loginService).not.toHaveBeenCalled()
    expect(mocks.revokeAllSessions).not.toHaveBeenCalled()
    expect(mocks.createAppSession).not.toHaveBeenCalled()
    expect(captureException).toHaveBeenCalledWith(expect.any(Error), {
      extra: expect.objectContaining({
        email: 'us***@ex***',
      }) as Record<string, unknown>,
    })
  })
})
