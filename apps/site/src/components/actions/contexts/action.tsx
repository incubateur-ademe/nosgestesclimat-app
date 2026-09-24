'use client'

import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import { createContext, useContext } from 'react'

export interface ActionContext {
  assessmentStatus?: AssessmentStatus | null
  totalFootprint?: number
}

interface ProviderProps {
  children: React.ReactNode
  values: ActionContext
}

export const ActionContext = createContext<ActionContext>({
  assessmentStatus: undefined,
  totalFootprint: undefined,
})

export const ActionProvider = ({ children, values }: ProviderProps) => (
  <ActionContext.Provider value={values}>{children}</ActionContext.Provider>
)

export const useActionContext = () => useContext(ActionContext)
