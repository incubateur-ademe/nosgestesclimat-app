import { createVerificationCode } from '@/services/auth/create-verification-code'
import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  CREATE_VERIFICATION_CODE_ERROR,
  useCreateVerificationCode,
} from '../useCreateVerificationCode'

vi.mock('@/services/auth/create-verification-code')
vi.mock('@/utils/browser/safeSessionStorage')

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    )
  }
}

describe('useCreateVerificationCode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('formats the email, calls the service, stores it in sessionStorage and invokes the callback on success', async () => {
    const mockCreateVerificationCode = vi.mocked(createVerificationCode)
    const mockSetItem = vi.mocked(safeSessionStorage.setItem)
    const onCompleteAction = vi.fn()

    mockCreateVerificationCode.mockResolvedValue({
      expirationDate: '2025-12-31T23:59:59.000Z',
    })

    const { result } = renderHook(
      () => useCreateVerificationCode({ onCompleteAction }),
      { wrapper: createWrapper() }
    )

    await result.current.createVerificationCode('  User@Example.COM  ')

    await waitFor(() => {
      expect(mockCreateVerificationCode).toHaveBeenCalledWith({
        email: 'user@example.com',
        locale: 'fr',
      })
    })

    expect(mockSetItem).toHaveBeenCalledWith(
      'email-pending-authentication',
      'user@example.com'
    )

    expect(onCompleteAction).toHaveBeenCalledWith({
      email: 'user@example.com',
      expirationDate: expect.any(Date),
    })
    const receivedDate = onCompleteAction.mock.calls[0][0].expirationDate
    expect(receivedDate.toISOString()).toBe('2025-12-31T23:59:59.000Z')
  })

  it('silently swallows errors and does not invoke the callback on failure', async () => {
    const mockCreateVerificationCode = vi.mocked(createVerificationCode)
    const onCompleteAction = vi.fn()

    mockCreateVerificationCode.mockRejectedValue(new Error('Server error'))

    const { result } = renderHook(
      () => useCreateVerificationCode({ onCompleteAction }),
      { wrapper: createWrapper() }
    )

    // Should not throw
    await expect(
      result.current.createVerificationCode('user@example.com')
    ).resolves.toBeUndefined()

    expect(onCompleteAction).not.toHaveBeenCalled()
  })

  it('exposes the error flag when the mutation fails', async () => {
    const mockCreateVerificationCode = vi.mocked(createVerificationCode)
    mockCreateVerificationCode.mockRejectedValue(new Error('Server error'))

    const { result } = renderHook(() => useCreateVerificationCode(), {
      wrapper: createWrapper(),
    })

    await result.current.createVerificationCode('user@example.com')

    await waitFor(() => {
      expect(result.current.createVerificationCodeError).toBe(
        CREATE_VERIFICATION_CODE_ERROR.UNKNOWN_ERROR
      )
    })
  })

  it('reflects the pending state correctly', async () => {
    const mockCreateVerificationCode = vi.mocked(createVerificationCode)
    let resolvePromise: (value: { expirationDate: string }) => void

    mockCreateVerificationCode.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve
        })
    )

    const { result } = renderHook(() => useCreateVerificationCode(), {
      wrapper: createWrapper(),
    })

    const promise = result.current.createVerificationCode('user@example.com')

    await waitFor(() => {
      expect(result.current.createVerificationCodePending).toBe(true)
    })

    resolvePromise!({ expirationDate: '2025-12-31T23:59:59.000Z' })
    await promise

    await waitFor(() => {
      expect(result.current.createVerificationCodePending).toBe(false)
    })
  })
})
