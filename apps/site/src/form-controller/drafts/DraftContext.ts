'use client'

import type { DraftStore } from '@/form-controller/drafts/useDraftStore'
import { createContext } from 'react'

const DraftContext = createContext<DraftStore | null>(null)

export default DraftContext
