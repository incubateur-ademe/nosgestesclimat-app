import type { Dispatch, ReactNode, SetStateAction } from 'react'
import { createContext, useState } from 'react'

export const FloatingElementDisplayedContext = createContext<{
  floatingElementDisplayed: string
  setFloatingElementDisplayed: Dispatch<SetStateAction<string>>
}>({
  floatingElementDisplayed: '',
  setFloatingElementDisplayed: () => {},
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
