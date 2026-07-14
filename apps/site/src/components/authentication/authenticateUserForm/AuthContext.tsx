'use client'

import { createContext, useContext, useReducer, type ReactNode } from 'react'

import type { AuthenticationMode } from '@/types/authentication'

import { useAuthCodeCreation } from './_hooks/useAuthCodeCreation'
import { useAuthCompletion } from './_hooks/useAuthCompletion'
import { useAuthLogin } from './_hooks/useAuthLogin'
import { authReducer, initialAuthPhase, type AuthPhase } from './authMachine'

export interface AuthContextValue {
  state: AuthPhase
  sendEmail: (email: string) => Promise<void>
  verifyCode: (code: string) => void
  resendCode: (email: string) => Promise<void>
  goBack: () => void
  reset: () => void
  clearLoginError: () => void
  isCreatingCode: boolean
  hasEmailError: boolean
  hasResendError: boolean
  loginError: Error | null
  mode?: AuthenticationMode
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within <AuthProvider>')
  }
  return ctx
}

export interface AuthProviderProps {
  children: ReactNode
  mode?: AuthenticationMode
  redirectPathname?: string
  onComplete?: (user: { email: string; userId: string }) => void | Promise<void>
  tracker?: {
    eventName: string
    properties?: Record<string, string | number | boolean | null | undefined>
  }
}

export function AuthProvider({
  children,
  mode,
  redirectPathname,
  onComplete,
  tracker,
}: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthPhase)

  // Complete auth process (post-auth side effects)
  const { completeVerification, registerVerification } = useAuthCompletion({
    dispatch,
    onComplete,
    redirectPathname,
    tracker,
  })

  // Code creation (send / resend verification email)
  const {
    sendEmail,
    resendCode,
    isCreatingCode,
    createVerificationCodeError,
    resetCodeCreation,
  } = useAuthCodeCreation({
    dispatch,
    onRegisterVerification: registerVerification,
  })

  // Code verification (login mutation)
  const { verifyCode, goBack, reset, loginError, clearLoginError } =
    useAuthLogin({
      state,
      dispatch,
      completeVerification,
      resetCodeCreation,
    })

  return (
    <AuthContext.Provider
      value={{
        state,
        sendEmail,
        verifyCode,
        resendCode,
        goBack,
        reset,
        clearLoginError,
        isCreatingCode,
        hasEmailError: !!createVerificationCodeError && state.phase === 'idle',
        hasResendError:
          !!createVerificationCodeError && state.phase === 'code_sent',
        loginError,
        mode,
      }}>
      {children}
    </AuthContext.Provider>
  )
}
