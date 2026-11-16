'use client'

import Trans from '@/components/translation/trans/TransClient'
import type { Journey } from '@/types/journey'
import { motion } from 'framer-motion'
import type { Dispatch, SetStateAction } from 'react'
import JourneyItem from './_components/JourneyItem'
import Summary from './_components/Summary'
import AddJourneyMobile from './journeysInputMobile/AddJourneyMobile'

interface Props {
  journeys: Journey[]
  setJourneys: Dispatch<SetStateAction<Journey[]>>
  averagePassengers: number
  total: number
  totalForOnePassenger: number
}

export default function JourneysInputMobile({
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
      className="border-primary-50 mb-2 block w-full overflow-scroll rounded-xl border-2 bg-white p-2 lg:hidden">
      <table className="block w-full border-collapse">
        <tbody className="block w-full">
          <AddJourneyMobile
            className="block"
            key={`${journeys.length}-mobile`}
            setJourneys={setJourneys}
          />

          {journeys.length > 0 && (
            <tr className="mt-4 block w-full text-left">
              <th className="mb-2 block">
                <Trans>Vos trajets :</Trans>
              </th>
            </tr>
          )}

          {journeys.map((journey, index) => (
            <JourneyItem
              key={journey.id}
              journey={journey}
              odd={index % 2 ? false : true}
              setJourneys={setJourneys}
            />
          ))}
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
