import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useDeleteUserAccount } from '../useDeleteUserAccount'

const { deleteUserAccountMock, resetLocalUserStateAndIdentityMock, toastErrorMock } =
  vi.hoisted(() => ({
    deleteUserAccountMock: vi.fn(),
    resetLocalUserStateAndIdentityMock: vi.fn(),
    toastErrorMock: vi.fn(),
  }))

describe('useDeleteUserAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('clears the local user state on success', async () => {
    deleteUserAccountMock.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteUserAccount())

    await act(async () => {
      result.current.deleteUserAccount()
      await Promise.resolve()
    })

    expect(resetLocalUserStateAndIdentityMock).toHaveBeenCalledOnce()
    expect(toastErrorMock).not.toHaveBeenCalled()
  })

  it('does not toast when the logout redirect is thrown', async () => {
    deleteUserAccountMock.mockRejectedValueOnce(new Error('NEXT_REDIRECT'))

    const { result } = renderHook(() => useDeleteUserAccount())

    await act(async () => {
      result.current.deleteUserAccount()
      await Promise.resolve()
    })

    expect(resetLocalUserStateAndIdentityMock).not.toHaveBeenCalled()
    expect(toastErrorMock).not.toHaveBeenCalled()
  })

  it('toasts on any other error', async () => {
    deleteUserAccountMock.mockRejectedValueOnce(new Error('Boom'))

    const { result } = renderHook(() => useDeleteUserAccount())

    await act(async () => {
      result.current.deleteUserAccount()
      await Promise.resolve()
    })

    expect(resetLocalUserStateAndIdentityMock).not.toHaveBeenCalled()
    expect(toastErrorMock).toHaveBeenCalledOnce()
  })
})

vi.mock('@/services/users/delete-user-account', () => ({
  deleteUserAccount: deleteUserAccountMock,
}))

vi.mock('@/helpers/user/reset-local-user-state-and-identity', () => ({
  resetLocalUserStateAndIdentity: resetLocalUserStateAndIdentityMock,
}))

vi.mock('@/publicodes-state', () => ({
  useUser: () => ({ setUser: vi.fn(), setSimulation: vi.fn() }),
}))

vi.mock('@/utils/analytics/trackEvent', () => ({ trackEvent: vi.fn() }))

vi.mock('@/logger/logger.browser', () => ({
  default: { child: () => ({ warn: vi.fn() }) },
}))

vi.mock('sonner', () => ({ toast: { error: toastErrorMock } }))
