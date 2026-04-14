import type { ReactNode } from 'react'
import { createContext, useState } from 'react'

export const FloatingElementDisplayedContext = createContext({
  floatingElementDisplayed: '',
  setFloatingElementDisplayed: (() => {}) as React.Dispatch<
    React.SetStateAction<string>
  >,
})

export const FloatingElementDisplayedProvider = ({
  children,
}: {
  children: ReactNode
}) => {
  const [floatingElementDisplayed, setFloatingElementDisplayed] =
    useState<string>('')

  return (
    <FloatingElementDisplayedContext.Provider
      value={{
        floatingElementDisplayed,
        setFloatingElementDisplayed,
      }}>
      {children}
    </FloatingElementDisplayedContext.Provider>
  )
}
