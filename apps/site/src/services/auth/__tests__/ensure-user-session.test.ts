import type { AppUser } from '@nosgestesclimat/core/features/auth/types/user-session'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ensureUserSession } from '../ensure-user-session'

const sessionMock = vi.hoisted(() => ({
  getUserSession: vi.fn(),
}))

const registerMock = vi.hoisted(() => ({
  registerUnverifiedUser: vi.fn(),
}))

const appSessionMock = vi.hoisted(() => ({
  createAppSession: vi.fn(),
}))

vi.mock('../get-user-session', () => ({
  getUserSession: sessionMock.getUserSession,
}))

vi.mock(
  '@nosgestesclimat/core/features/users/services/register-unverified-user.service',
  () => ({
    registerUnverifiedUser: registerMock.registerUnverifiedUser,
  })
)

vi.mock('../create-app-session', () => ({
  createAppSession: appSessionMock.createAppSession,
}))

const authUser: AppUser = {
  id: crypto.randomUUID(),
  email: 'alice@example.com',
  isAuth: true,
}

describe('ensureUserSession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the existing session without creating a user or a new session', async () => {
    sessionMock.getUserSession.mockResolvedValue(authUser)

    const result = await ensureUserSession()

    expect(result).toEqual(authUser)
    expect(registerMock.registerUnverifiedUser).not.toHaveBeenCalled()
    expect(appSessionMock.createAppSession).not.toHaveBeenCalled()
  })

  it('creates an anonymous account and a session for a first-time visitor', async () => {
    const newUserId = crypto.randomUUID()
    sessionMock.getUserSession.mockResolvedValue(null)
    registerMock.registerUnverifiedUser.mockResolvedValue({ id: newUserId })

    const result = await ensureUserSession()

    expect(result).toEqual({ id: newUserId, isAuth: false })
    expect(appSessionMock.createAppSession).toHaveBeenCalledWith(newUserId)
  })
})
