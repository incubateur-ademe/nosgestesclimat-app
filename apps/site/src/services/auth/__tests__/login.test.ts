import {
  InvalidCodeError,
  RateLimitedError,
  UnknownCodeError,
} from '@/components/authentication/errors'
import { serverLoggerMock } from '@/helpers/tests/mockLogger'
import { InvalidVerificationCodeError } from '@nosgestesclimat/core/features/auth/errors/login.error'
import { failure, success } from '@nosgestesclimat/core/lib/result'
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
  loginService: vi.fn(),
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

vi.mock('@/adapters/brevoClient', () => ({
  sendEmail: mocks.sendEmail,
  addOrUpdateContact: mocks.addOrUpdateContact,
}))

vi.mock('@/helpers/server/rateLimitSameRequest', () => ({
  rateLimitSameRequest: mocks.rateLimitSameRequest,
}))

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))

vi.mock('next/server', () => ({ after: mocks.after }))

vi.mock('@/env/server', () => ({
  env: { NEXT_PUBLIC_SITE_URL: 'http://localhost:3000' },
}))

vi.mock('@/logger/logger.server', () => ({ default: serverLoggerMock }))

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
    mocks.rateLimitSameRequest.mockResolvedValue(success({ degraded: false }))
    mocks.getUserSession.mockResolvedValue({
      id: sessionUserId,
      isAuth: false,
    })
  })

  it('returns RateLimitedError and never reaches the service when throttled', async () => {
    mocks.rateLimitSameRequest.mockResolvedValue(
      failure(new RateLimitedError())
    )

    const result = await login({
      intent: 'create-account',
      email: 'user@example.com',
      code: '123456',
    })

    expect(result).toEqual(failure(new RateLimitedError()))
    expect(mocks.rateLimitSameRequest).toHaveBeenCalledWith({
      key: 'login:user@example.com',
      ttlInSeconds: 30,
    })
    expect(mocks.loginService).not.toHaveBeenCalled()
  })

  it('throttles a repeat of the same email with different casing', async () => {
    const throttledKeys = new Set<string>()
    mocks.rateLimitSameRequest.mockImplementation(
      ({ key }: { key: string }) => {
        const alreadyThrottled = throttledKeys.has(key)
        throttledKeys.add(key)

        return alreadyThrottled
          ? failure(new RateLimitedError())
          : success({ degraded: false })
      }
    )
    mocks.loginService.mockResolvedValue(
      failure(new InvalidVerificationCodeError())
    )

    const first = await login({
      intent: 'create-account',
      email: 'Case@Example.com',
      code: '123456',
    })
    const second = await login({
      intent: 'create-account',
      email: 'case@example.com',
      code: '123456',
    })

    expect(first).toEqual(failure(new InvalidCodeError()))
    expect(second).toEqual(failure(new RateLimitedError()))
    expect(mocks.rateLimitSameRequest).toHaveBeenNthCalledWith(1, {
      key: 'login:case@example.com',
      ttlInSeconds: 30,
    })
    expect(mocks.rateLimitSameRequest).toHaveBeenNthCalledWith(2, {
      key: 'login:case@example.com',
      ttlInSeconds: 30,
    })
    expect(mocks.loginService).toHaveBeenCalledTimes(1)
  })

  it('returns UnknownCodeError on a malformed code', async () => {
    const result = await login({
      intent: 'create-account',
      email: 'user@example.com',
      code: '12ab',
    })

    expect(result).toEqual(failure(new UnknownCodeError()))
    expect(mocks.loginService).not.toHaveBeenCalled()
  })

  it('returns UnknownCodeError on an unsupported locale', async () => {
    const result = await login({
      intent: 'create-account',
      email: 'user@example.com',
      code: '123456',
      locale: 'de',
    })

    expect(result).toEqual(failure(new UnknownCodeError()))
    expect(mocks.loginService).not.toHaveBeenCalled()
  })

  it('returns UnknownCodeError on an unknown intent', async () => {
    const result = await login({
      // @ts-expect-error an intent outside the contract must be rejected
      intent: 'not-an-intent',
      email: 'user@example.com',
      code: '123456',
    })

    expect(result).toEqual(failure(new UnknownCodeError()))
    expect(mocks.loginService).not.toHaveBeenCalled()
  })

  it('logs in through the core service and rotates the session', async () => {
    mocks.loginService.mockResolvedValue(
      success({ user: verifiedUser, mode: 'signUp' })
    )

    const result = await login({
      intent: 'create-account',
      email: 'User@Example.com',
      code: '123456',
      locale: 'en',
    })

    expect(mocks.loginService).toHaveBeenCalledWith({
      email: 'user@example.com',
      code: '123456',
      locale: 'en',
      intent: 'create-account',
      sessionUserId,
    })
    expect(mocks.revokeAllSessions).toHaveBeenCalledWith(sessionUserId)
    expect(mocks.createAppSession).toHaveBeenCalledWith(
      verifiedUser.id,
      'User@Example.com'
    )
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')

    expect(result).toEqual(success({ userId: verifiedUser.id }))
  })

  it('creates a session without revoking anything when there is no prior session', async () => {
    mocks.getUserSession.mockResolvedValue(null)
    mocks.loginService.mockResolvedValue(
      success({ user: verifiedUser, mode: 'signIn' })
    )

    const result = await login({
      intent: 'create-account',
      email: 'user@example.com',
      code: '123456',
      locale: 'en',
    })

    expect(mocks.loginService).toHaveBeenCalledWith({
      email: 'user@example.com',
      code: '123456',
      locale: 'en',
      intent: 'create-account',
      sessionUserId: undefined,
    })
    expect(mocks.revokeAllSessions).not.toHaveBeenCalled()
    expect(mocks.createAppSession).toHaveBeenCalledWith(
      verifiedUser.id,
      'user@example.com'
    )
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/')

    expect(result).toEqual(success({ userId: verifiedUser.id }))
  })

  it('logs the login attempt and the success outcome', async () => {
    mocks.loginService.mockResolvedValue(
      success({ user: verifiedUser, mode: 'signIn' })
    )

    await login({
      intent: 'create-account',
      email: 'user@example.com',
      code: '123456',
      locale: 'en',
    })

    // The attempt's identity is bound to the span, and the locale to the lines.
    expect(serverLoggerMock.child).toHaveBeenCalledWith({
      email: 'us***@ex***',
      intent: 'create-account',
      scope: 'site.action.login',
    })
    expect(serverLoggerMock.child).toHaveBeenCalledWith({ locale: 'en' })

    expect(serverLoggerMock.info).toHaveBeenCalledWith('Login attempt', {
      sessionUserId,
    })
    // The outcome names the account, not the session it came in with.
    expect(serverLoggerMock.info).toHaveBeenCalledWith('Login succeeded', {
      sessionUserId,
      userId: verifiedUser.id,
      mode: 'signIn',
      durationMs: expect.any(Number) as number,
    })
  })

  it('logs the validated email and the defaulted locale when none is passed', async () => {
    mocks.loginService.mockResolvedValue(
      success({ user: verifiedUser, mode: 'signIn' })
    )

    await login({
      intent: 'create-account',
      email: 'User@Example.com',
      code: '123456',
    })

    expect(serverLoggerMock.child).toHaveBeenCalledWith({ locale: 'fr' })
    expect(serverLoggerMock.info).toHaveBeenCalledWith('Login attempt', {
      sessionUserId,
    })
  })

  it('maps the InvalidVerificationCodeError domain failure to InvalidCodeError', async () => {
    mocks.loginService.mockResolvedValue(
      failure(new InvalidVerificationCodeError())
    )

    const result = await login({
      intent: 'create-account',
      email: 'user@example.com',
      code: '000000',
    })

    expect(result).toEqual(failure(new InvalidCodeError()))
    expect(serverLoggerMock.warn).toHaveBeenCalledWith(
      expect.any(InvalidVerificationCodeError),
      expect.objectContaining({ sessionUserId })
    )
    expect(mocks.revokeAllSessions).not.toHaveBeenCalled()
    expect(mocks.createAppSession).not.toHaveBeenCalled()
  })

  it('maps an unexpected error to UnknownCodeError', async () => {
    mocks.loginService.mockRejectedValue(new Error('Prisma is down'))

    const result = await login({
      intent: 'create-account',
      email: 'user@example.com',
      code: '123456',
    })

    expect(result).toEqual(failure(new UnknownCodeError()))
    // The email it came from is on the span, through the bindings.
    expect(serverLoggerMock.child).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'us***@ex***' })
    )
    expect(serverLoggerMock.error).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ sessionUserId })
    )
    expect(mocks.createAppSession).not.toHaveBeenCalled()
  })

  it('collapses a getUserSession throw into a Result failure instead of rejecting the mutation', async () => {
    mocks.getUserSession.mockRejectedValue(new Error('session store down'))

    const result = await login({
      intent: 'create-account',
      email: 'user@example.com',
      code: '123456',
    })

    expect(result).toEqual(failure(new UnknownCodeError()))
    expect(mocks.loginService).not.toHaveBeenCalled()
    expect(mocks.revokeAllSessions).not.toHaveBeenCalled()
    expect(mocks.createAppSession).not.toHaveBeenCalled()
    // The email it came from is on the span, through the bindings; the session
    // user was never read, so the line has none.
    expect(serverLoggerMock.child).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'us***@ex***' })
    )
    expect(serverLoggerMock.error).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ sessionUserId: undefined })
    )
  })
})
