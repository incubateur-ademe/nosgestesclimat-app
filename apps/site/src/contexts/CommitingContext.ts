'use client'

import { createContext, useContext } from 'react'

interface CommittingContextType {
  isCommitting: boolean
  setIsCommitting: (committing: boolean) => void
}

export const CommittingContext = createContext<CommittingContextType>({
  isCommitting: false,
  setIsCommitting: () => {},
})

export function useCommitting() {
  return useContext(CommittingContext)
}
