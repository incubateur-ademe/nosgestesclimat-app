'use client'

import { createContext, useContext, type ReactNode } from 'react'

import type { AuthenticationMode } from '@/types/authentication'

import { useAuthCodeCreation } from './_hooks/useAuthCodeCreation'
import { useAuthEffects } from './_hooks/useAuthEffects'
import { useAuthActions } from './_hooks/useAuthActions'
import { usePersistentAuthPhase } from './_hooks/usePersistentAuthPhase'
import type { AuthPhase, AuthenticatedUser, Tracker, VerifyStrategy } from './types'

export interface AuthContextValue {
  state: AuthPhase
  sendEmail: (email: string) => Promise<void>
  submitCode: (code: string) => void
  resendCode: (email: string) => Promise<void>
  goBack: () => void
  reset: () => void
  clearCodeError: () => void
  isCreatingCode: boolean
  mode?: AuthenticationMode
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>')
  }
  return ctx
}

interface AuthProviderProps {
  children: ReactNode
  verify: VerifyStrategy
  mode?: AuthenticationMode
  redirectPathname?: string
  onComplete?: (user: AuthenticatedUser) => void | Promise<void>
  tracker?: Tracker
}

export function AuthProvider({
  children,
  verify,
  mode,
  redirectPathname,
  onComplete,
  tracker,
}: AuthProviderProps) {
  const [state, dispatch] = usePersistentAuthPhase()

  const { sendEmail, resendCode, isCreatingCode } =
    useAuthCodeCreation({ dispatch })

  useAuthEffects({
    state,
    dispatch,
    verify,
    onComplete,
    redirectPathname,
    tracker,
  })

  const { submitCode, goBack, reset, clearCodeError } =
    useAuthActions(dispatch)

  return (
    <AuthContext.Provider
      value={{
        state,
        sendEmail,
        submitCode,
        resendCode,
        goBack,
        reset,
        clearCodeError,
        isCreatingCode,
        mode,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
