import type { Journey } from '@/types/journey'
import type { Dispatch, SetStateAction } from 'react'
import { JourneysInputDesktop } from './journeysInput/JourneysInputDesktop'
import JourneysInputMobile from './journeysInput/JourneysInputMobile'

interface Props {
  journeys: Journey[]
  setJourneys: Dispatch<SetStateAction<Journey[]>>
  total: number
  averagePassengers: number
  totalForOnePassenger: number
}

export default function JourneysInput({
  journeys,
  setJourneys,
  total,
  averagePassengers,
  totalForOnePassenger,
}: Props) {
  return (
    <div className="flex-1">
      <JourneysInputDesktop
        journeys={journeys}
        setJourneys={setJourneys}
        averagePassengers={averagePassengers}
        total={total}
        totalForOnePassenger={totalForOnePassenger}
      />
      <JourneysInputMobile
        journeys={journeys}
        setJourneys={setJourneys}
        averagePassengers={averagePassengers}
        total={total}
        totalForOnePassenger={totalForOnePassenger}
      />
    </div>
  )
}
