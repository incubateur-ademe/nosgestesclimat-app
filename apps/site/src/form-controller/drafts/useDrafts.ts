'use client'

import DraftContext from '@/form-controller/drafts/DraftContext'
import type { DraftStore } from '@/form-controller/drafts/useDraftStore'
import { useContext } from 'react'

function useOptionalDrafts(): DraftStore | null {
  return useContext(DraftContext)
}

/** The form controller's single draft mirror (see useDraftStore). */
export function useDrafts(): DraftStore {
  const drafts = useOptionalDrafts()
  if (!drafts) {
    throw new Error('useDrafts() must be used within the form controller.')
  }
  return drafts
}
