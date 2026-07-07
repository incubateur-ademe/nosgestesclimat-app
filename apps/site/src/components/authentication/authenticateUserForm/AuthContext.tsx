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
  verifyCode: (code: string, email: string) => Promise<void>
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

export function useAuthContext(): AuthContextValue | null {
  return useContext(AuthContext)
}

export interface AuthProviderProps {
  children: ReactNode
  mode?: AuthenticationMode
  redirectPathname?: string
  onComplete?: (user: { email: string; userId: string }) => void | Promise<void>
  trackers?: {
    posthog: {
      eventName: string
      properties?: Record<string, string | number | boolean | null | undefined>
    }
  }
}

export function AuthProvider({
  children,
  mode,
  redirectPathname,
  onComplete,
  trackers,
}: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthPhase)

  // Complete auth process (post-auth side effects)
  const { completeVerification, registerVerification } = useAuthCompletion({
    dispatch,
    onComplete,
    redirectPathname,
    trackers,
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
    phase: state.phase,
    onRegisterVerification: registerVerification,
  })

  // Code verification (login mutation)
  const { verifyCode, goBack, reset, loginError, clearLoginError } =
    useAuthLogin({
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
