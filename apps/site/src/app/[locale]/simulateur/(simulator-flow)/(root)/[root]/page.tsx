'use client'

import { useAutoSaveSimulation } from '@/hooks/simulation/useAutoSaveSimulation'
import { useTrackSimulator } from '@/hooks/tracking/useTrackSimulator'
import Form from './_components/Form'

export default function Layout() {
  useAutoSaveSimulation()
  useTrackSimulator()

  return <Form />
}
