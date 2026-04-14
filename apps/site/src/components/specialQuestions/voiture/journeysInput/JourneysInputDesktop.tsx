'use client'

import Trans from '@/components/translation/trans/TransClient'
import type { Journey } from '@/types/journey'
import { motion } from 'framer-motion'
import type { Dispatch, SetStateAction } from 'react'
import JourneyItem from './_components/JourneyItem'
import Summary from './_components/Summary'
import AddJourneyDesktop from './journeysInputDesktop/AddJourneyDesktop'

interface Props {
  journeys: Journey[]
  setJourneys: Dispatch<SetStateAction<Journey[]>>
  averagePassengers: number
  total: number
  totalForOnePassenger: number
}

export function JourneysInputDesktop({
  journeys,
  setJourneys,
  averagePassengers,
  total,
  totalForOnePassenger,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="border-primary-50 mb-2 hidden w-full overflow-scroll rounded-xl border-2 bg-white p-2 text-xs lg:block">
      <table className="table w-full border-collapse">
        <tbody className="block w-full">
          <tr className="table-row w-full">
            <th className="table-cell p-2 text-left text-xs" id="label-label">
              <Trans>Label</Trans>
            </th>
            <th
              className="table-cell p-2 text-left text-xs"
              id="label-distance">
              <Trans>Distance</Trans>
            </th>
            <th
              className="table-cell p-2 text-left text-xs"
              id="label-frequency">
              <Trans>Fréquence</Trans>
            </th>
            <th className="table-cell p-2 text-left text-xs" id="label-time">
              <Trans>Période</Trans>
            </th>
            <th
              className="table-cell p-2 text-left text-xs"
              id="label-passengers">
              <Trans>Passagers</Trans>
            </th>
            <th
              className="table-cell p-2 text-left text-xs opacity-0"
              id="label-options">
              <Trans>Options</Trans>
            </th>
          </tr>

          {journeys.map((journey, index) => (
            <JourneyItem
              key={journey.id}
              journey={journey}
              odd={index % 2 ? false : true}
              setJourneys={setJourneys}
            />
          ))}

          <AddJourneyDesktop key={journeys.length} setJourneys={setJourneys} />
        </tbody>
      </table>

      <Summary
        total={total}
        averagePassengers={averagePassengers}
        totalForOnePassenger={totalForOnePassenger}
      />
    </motion.div>
  )
}
