import i18nConfig from '@/i18nConfig'
import { faker } from '@faker-js/faker'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { logout } from '../logout'

const mocks = vi.hoisted(() => ({
  getUserSession: vi.fn(),
  revokeAllSessions: vi.fn(),
  deleteSessionCookies: vi.fn(),
  cookieDelete: vi.fn(),
  revalidatePath: vi.fn(),
}))

describe('logout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.deleteSessionCookies.mockReturnValue([
      { name: 'ngc_session', options: { path: '/', maxAge: 0 } },
      { name: 'ngc_refresh', options: { path: '/', maxAge: 0 } },
    ])
  })

  it('revokes the sessions, clears the cookies and revalidates every locale', async () => {
    const sessionId = faker.string.uuid()
    mocks.getUserSession.mockResolvedValue({ id: sessionId, isAuth: true })

    await logout()

    expect(mocks.revokeAllSessions).toHaveBeenCalledWith(sessionId)
    expect(mocks.cookieDelete).toHaveBeenCalledWith({
      name: 'ngc_session',
      path: '/',
      maxAge: 0,
    })
    expect(mocks.cookieDelete).toHaveBeenCalledWith({
      name: 'ngc_refresh',
      path: '/',
      maxAge: 0,
    })
    for (const locale of i18nConfig.locales) {
      expect(mocks.revalidatePath).toHaveBeenCalledWith(`/${locale}`, 'layout')
    }
  })

  it('still clears the cookies without a session', async () => {
    mocks.getUserSession.mockResolvedValue(null)

    await logout()

    expect(mocks.revokeAllSessions).not.toHaveBeenCalled()
    expect(mocks.cookieDelete).toHaveBeenCalledTimes(2)
  })
})

vi.mock('@/services/auth/get-user-session', () => ({
  getUserSession: mocks.getUserSession,
}))

vi.mock(
  '@nosgestesclimat/core/features/auth/services/revoke-all-sessions.service',
  () => ({ revokeAllSessions: mocks.revokeAllSessions })
)

vi.mock('@/helpers/server/cookie/auth.cookie', () => ({
  deleteSessionCookies: mocks.deleteSessionCookies,
}))

vi.mock('next/headers', () => ({
  cookies: () => ({ delete: mocks.cookieDelete }),
}))

vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidatePath }))
