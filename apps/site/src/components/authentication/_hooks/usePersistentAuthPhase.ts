'use client'

import { safeSessionStorage } from '@/utils/browser/safeSessionStorage'
import { useEffect, useReducer, type Dispatch } from 'react'
import { authReducer, initialAuthPhase } from '../authMachine'
import type { AuthEvent, AuthPhase } from '../types'

const STORAGE_KEY = 'auth-phase'

function loadPersistedPhase(): AuthPhase {
  try {
    const raw = safeSessionStorage.getItem(STORAGE_KEY)
    if (!raw) return initialAuthPhase

    const parsed = JSON.parse(raw)

    if (parsed.phase !== 'code_sent') {
      return initialAuthPhase
    }

    if (parsed.pending?.expirationDate) {
      const expirationDate = new Date(parsed.pending.expirationDate)
      if (isNaN(expirationDate.getTime()) || expirationDate < new Date()) {
        return initialAuthPhase
      }
    }

    return parsed as AuthPhase
  } catch {
    return initialAuthPhase
  }
}

function persistPhase(state: AuthPhase): void {
  if (state.phase === 'code_sent') {
    try {
      safeSessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // storage full or unavailable — ignore
    }
  } else if (state.phase === 'idle' || state.phase === 'authenticated') {
    safeSessionStorage.removeItem(STORAGE_KEY)
  }
  // email_sending, verifying_code: keep last code_sent
}

export function usePersistentAuthPhase(): [AuthPhase, Dispatch<AuthEvent>] {
  const [state, dispatch] = useReducer(authReducer, initialAuthPhase)

  useEffect(() => {
    const persisted = loadPersistedPhase()
    if (persisted.phase !== 'idle') {
      dispatch({ type: 'HYDRATE', phase: persisted })
    }
  }, [])

  useEffect(() => {
    persistPhase(state)
  }, [state])

  return [state, dispatch]
}
