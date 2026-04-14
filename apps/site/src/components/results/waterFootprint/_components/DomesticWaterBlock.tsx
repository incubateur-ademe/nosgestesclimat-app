import Trans from '@/components/translation/trans/TransServer'
import type { Locale } from '@/i18nConfig'
import { type ReactNode } from 'react'

interface Props {
  locale: Locale
}

const AVERAGE_CONSUMPTION_IN_LITERS = 149

export default function DomesticWaterBlock({ locale }: Props) {
  return (
    <div className="mb-6 self-center">
      <div className="bg-water flex gap-4 rounded-xl p-4 lg:pr-8">
        <svg
          className="h-auto w-8 fill-white"
          width="48"
          height="48"
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg">
          <path d="M37.7916 23.6907L24.197 1.45337L11.5996 23.5387C8.66632 28.2187 8.41032 34.304 11.4916 39.344C15.8716 46.508 25.309 48.808 32.573 44.4867C39.8343 40.1667 42.1716 30.86 37.7916 23.6907Z" />
        </svg>

        <p className="mb-0 text-lg text-white">
          <Trans
            locale={locale}
            i18nKey="simulation.eau.whatIsWaterFootprint.showerWater.average"
            values={{ average: AVERAGE_CONSUMPTION_IN_LITERS }}>
            La moyenne française est de{' '}
            <strong>
              {
                {
                  average: AVERAGE_CONSUMPTION_IN_LITERS,
                } as unknown as ReactNode
              }{' '}
              litres par jour
            </strong>
          </Trans>
        </p>
      </div>
    </div>
  )
}
