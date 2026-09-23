'use client'

import { LOCALE_FR_KEY, type Locale } from '@/i18nConfig'
import type { AssessmentStatus } from '@nosgestesclimat/core/features/actions/services/get-personalized-actions-catalogue.service'
import { createContext, useContext } from 'react'
import type { ActionFrom } from '../types/actions'

interface ActionValuesShared {
  assessmentStatus: AssessmentStatus | null | undefined
  totalFootprint: number | undefined
  from?: ActionFrom
  locale: Locale
  shouldHideActionCommitFeature?: boolean
}

interface ProviderProps {
  children: React.ReactNode
  values: ActionValuesShared
}

export const actionContext = createContext<ActionValuesShared>({
  assessmentStatus: undefined,
  totalFootprint: undefined,
  from: undefined,
  locale: LOCALE_FR_KEY,
  shouldHideActionCommitFeature: false,
})

export const ActionProvider = ({ children, values }: ProviderProps) => (
  <actionContext.Provider value={values}>{children}</actionContext.Provider>
)

export const useActionContext = () => useContext(actionContext)
