'use client'

import { useEngine } from '@/publicodes-state'
import RavijenChart from './RavijenChart'

export default function BilanChart() {
  const { categories, subcategories } = useEngine()

  return <RavijenChart categories={categories} subcategories={subcategories} />
}
