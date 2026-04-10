'use client'

import { createContext, useState } from 'react'

interface IsDocumentationClientContextType {
  isDocumentationClient: boolean
  setIsDocumentationClient: (isDocumentationClient: boolean) => void
}

export const IsDocumentationClientContext =
  createContext<IsDocumentationClientContextType>({
    isDocumentationClient: false,
    setIsDocumentationClient: () => {},
  })

export const IsDocumentationClientProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [isDocumentationClient, setIsDocumentationClient] = useState(false)

  return (
    <IsDocumentationClientContext.Provider
      value={{
        isDocumentationClient,
        setIsDocumentationClient,
      }}>
      {children}
    </IsDocumentationClientContext.Provider>
  )
}
