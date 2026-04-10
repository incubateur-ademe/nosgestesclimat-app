import { useRule } from '@/publicodes-state'
import type { Journey } from '@/types/journey'

import { useEffect, useMemo, useRef, useState } from 'react'

import { safeLocalStorage } from '@/utils/browser/safeLocalStorage'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { JourneysInputDesktop } from './journeysInput/JourneysInputDesktop'
import JourneysInputMobile from './journeysInput/JourneysInputMobile'

interface Props {
  question: DottedName
  setTempValue?: (value: number | undefined) => void
  setDisplayedValue?: (value: string | undefined) => void
}

const periods: Record<string, number> = {
  day: 365,
  week: 52,
  month: 12,
  year: 1,
}

function roundFloat(value: number, precision = 10): number {
  return Math.round(value * precision) / precision
}

export default function JourneysInput({
  question,
  setTempValue,
  setDisplayedValue,
}: Props) {
  const { setValue } = useRule(question)

  const { setValue: setNumPassengers } = useRule(
    'transport . voiture . voyageurs'
  )

  const [isInitialized, setIsInitialized] = useState(false)

  const [journeys, setJourneys] = useState<Journey[]>([])

  useEffect(() => {
    setJourneys(JSON.parse(safeLocalStorage.getItem(question) || '[]'))
    setIsInitialized(true)
  }, [question, isInitialized])

  useEffect(() => {
    if (isInitialized) {
      safeLocalStorage.setItem(question, JSON.stringify(journeys))
    }
  }, [journeys, isInitialized, question])

  const total = useMemo(() => {
    const rawTotal = journeys.reduce(
      (accumulator, currentValue) =>
        accumulator +
        currentValue.distance *
          currentValue.reccurrence *
          periods[currentValue.period],
      0
    )
    const roundedTotal = roundFloat(rawTotal)
    return roundedTotal
  }, [journeys])

  const averagePassengers = useMemo(() => {
    if (!total) {
      return 1
    } else {
      const rawAveragePassengers =
        journeys.reduce(
          (accumulator, currentValue) =>
            accumulator +
            currentValue.passengers *
              currentValue.distance *
              currentValue.reccurrence *
              periods[currentValue.period],
          0
        ) / total
      const roundedAveragePassengers = roundFloat(rawAveragePassengers)
      return roundedAveragePassengers
    }
  }, [journeys, total])

  const totalForOnePassenger = useMemo(
    () => (journeys.length ? roundFloat(total / averagePassengers) : 0),
    [journeys, total, averagePassengers]
  )

  const prevTotal = useRef(total)

  const prevNumPassengers = useRef(averagePassengers)

  useEffect(() => {
    if (prevNumPassengers.current === averagePassengers) return

    setNumPassengers(averagePassengers)
    prevNumPassengers.current = averagePassengers
  }, [averagePassengers, setNumPassengers])

  useEffect(() => {
    if (prevTotal.current === total) return

    setTempValue?.(total)
    setDisplayedValue?.(String(total))
    setValue(total, { questionDottedName: question })
    prevTotal.current = total
  }, [
    total,
    averagePassengers,
    setValue,
    setNumPassengers,
    setTempValue,
    question,
    setDisplayedValue,
  ])

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
