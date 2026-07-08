import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useLogin } from '../useLogin'

// Mock the entire login module to avoid pulling in server-side encryption deps
const mockLoginFn = vi.fn()
vi.mock('@/services/auth/login', () => ({
  login: (...args: any[]) => mockLoginFn(...args),
}))

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

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls the login service with email, code and locale on mutateAsync', async () => {
    mockLoginFn.mockResolvedValue({ userId: 'user-123' })

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    })

    await result.current.mutateAsync({
      email: 'user@example.com',
      code: '123456',
    })

    await waitFor(() => {
      expect(mockLoginFn).toHaveBeenCalledWith({
        email: 'user@example.com',
        code: '123456',
        locale: 'fr',
      })
    })
  })

  it('exposes the raw error when the login service fails', async () => {
    const networkError = new Error('Network error')
    mockLoginFn.mockRejectedValue(networkError)

    const { result } = renderHook(() => useLogin(), {
      wrapper: createWrapper(),
    })

    await expect(
      result.current.mutateAsync({
        email: 'user@example.com',
        code: '123456',
      })
    ).rejects.toThrow('Network error')

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error)
    })
  })
})
