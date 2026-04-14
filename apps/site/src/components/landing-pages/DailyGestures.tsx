import Separator from '@/design-system/layout/Separator'
import type { GesturesType } from '@/types/landing-page'
import { Suspense, type JSX } from 'react'
import CTAButtonsPlaceholder from '../cta/CTAButtonsPlaceholder'
import DynamicCTAButtons from '../cta/DynamicCTAButtons'
import GestureSelector from './dailyGestures/GestureSelector'

export default function DailyGestures({
  title,
  description,
  gestures,
  trackingEvents,
}: {
  title: string
  description: string | JSX.Element
  gestures: GesturesType
  trackingEvents: {
    start: string[]
    resume: string[]
    results: string[]
  }
}) {
  return (
    <div className="mx-auto mt-16 mb-20 w-full max-w-full px-4 text-center md:my-20 md:max-w-[850px] md:px-0">
      <h2 className="text-xl md:text-3xl">{title}</h2>

      <Separator className="mx-auto my-4" />

      <section className="text-sm md:text-lg">{description}</section>

      <div className="mt-10 mb-24 flex w-full flex-col justify-between gap-10 md:mb-0 md:flex-row">
        <GestureSelector gestures={gestures} />
      </div>

      <div className="mt-10 text-center">
        <Suspense fallback={<CTAButtonsPlaceholder />}>
          <DynamicCTAButtons
            trackingEvents={trackingEvents}
            withRestart={false}
          />
        </Suspense>
      </div>
    </div>
  )
}
