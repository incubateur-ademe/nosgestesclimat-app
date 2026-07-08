import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AuthEvent } from '../../authMachine'
import { useAuthLogin } from '../useAuthLogin'

vi.mock('../useLogin', () => ({
  useLogin: vi.fn(),
}))

import { useLogin } from '../useLogin'

describe('useAuthLogin', () => {
  const mockDispatch = vi.fn() as React.Dispatch<AuthEvent>
  const mockCompleteVerification = vi.fn().mockResolvedValue(undefined)
  const mockResetCodeCreation = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  function setupMock(
    overrides: Partial<ReturnType<typeof useLogin>> = {}
  ): ReturnType<typeof useLogin> {
    const defaultReturn: ReturnType<typeof useLogin> = {
      mutateAsync: vi.fn().mockResolvedValue({ userId: 'user-123' }),
      error: null,
      reset: vi.fn(),
      ...overrides,
    } as unknown as ReturnType<typeof useLogin>

    vi.mocked(useLogin).mockReturnValue(defaultReturn)
    return defaultReturn
  }

  it('dispatches SUBMIT_CODE, then CODE_VALID and calls completeVerification on success', async () => {
    const login = setupMock()
    const { result } = renderHook(() =>
      useAuthLogin({
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    await act(async () => {
      await result.current.verifyCode('123456', 'user@example.com')
    })

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SUBMIT_CODE',
      code: '123456',
    })
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'CODE_VALID',
      userId: 'user-123',
    })
    expect(mockCompleteVerification).toHaveBeenCalledWith('user-123')
    expect(login.mutateAsync).toHaveBeenCalledWith({
      email: 'user@example.com',
      code: '123456',
    })
  })

  it('dispatches SUBMIT_CODE, then CODE_INVALID on login failure', async () => {
    setupMock({
      mutateAsync: vi.fn().mockRejectedValue(new Error('Invalid code')),
    })

    const { result } = renderHook(() =>
      useAuthLogin({
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    await act(async () => {
      await result.current.verifyCode('000000', 'user@example.com')
    })

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SUBMIT_CODE',
      code: '000000',
    })
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'CODE_INVALID' })
    expect(mockCompleteVerification).not.toHaveBeenCalled()
  })

  it('resets the login mutation, resets code creation and dispatches GO_BACK on goBack', () => {
    const login = setupMock()
    const { result } = renderHook(() =>
      useAuthLogin({
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    act(() => {
      result.current.goBack()
    })

    expect(login.reset).toHaveBeenCalled()
    expect(mockResetCodeCreation).toHaveBeenCalled()
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'GO_BACK' })
  })

  it('dispatches RESET on reset', () => {
    const { result } = renderHook(() =>
      useAuthLogin({
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    act(() => {
      result.current.reset()
    })

    expect(mockDispatch).toHaveBeenCalledWith({ type: 'RESET' })
  })

  it('resets the login mutation on clearLoginError', () => {
    const login = setupMock()
    const { result } = renderHook(() =>
      useAuthLogin({
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    act(() => {
      result.current.clearLoginError()
    })

    expect(login.reset).toHaveBeenCalled()
  })

  it('exposes the raw login error from the mutation', () => {
    const networkError = new Error('Network error')
    setupMock({ error: networkError })

    const { result } = renderHook(() =>
      useAuthLogin({
        dispatch: mockDispatch,
        completeVerification: mockCompleteVerification,
        resetCodeCreation: mockResetCodeCreation,
      })
    )

    expect(result.current.loginError).toBe(networkError)
  })
})
