'use client'

import Trans from '@/components/translation/trans/TransClient'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface Props {
  targetDate: string
  primaryCtaHref: string
  secondaryCtaHref: string
}

function calculateTimeLeft(targetDate: string): TimeLeft | null {
  const diff = new Date(targetDate).getTime() - Date.now()

  if (diff <= 0) return null

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

function pad(num: number): string {
  return num.toString().padStart(2, '0')
}

function AnimatedNumber({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="bg-primary-50 relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-slate-200 max-sm:h-12 max-sm:w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="text-xl font-bold tracking-tight max-sm:text-base sm:text-2xl md:text-3xl">
            {pad(value)}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1 text-[10px] font-medium text-slate-500 uppercase max-sm:text-[9px] sm:text-xs">
        {label}
      </span>
    </div>
  )
}

export default function EventCountdown({
  targetDate,
  primaryCtaHref,
  secondaryCtaHref,
}: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(() =>
    calculateTimeLeft(targetDate)
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate))
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  if (!timeLeft) {
    return null
  }

  return (
    <div className="relative rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
      <span className="mb-3 flex items-center text-amber-600 sm:mb-4">
        <span
          aria-hidden
          className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500 align-baseline motion-reduce:animate-none"
        />

        <span className="text-[10px] font-bold uppercase sm:text-xs">
          <Trans i18nKey="event.countdown.label">Début dans</Trans>
        </span>
      </span>

      <div className="mb-4 flex items-center justify-center gap-2 sm:mb-6 sm:gap-3 md:gap-4">
        <AnimatedNumber value={timeLeft.days} label="Jours" />
        <span className="mb-6 text-lg font-bold text-slate-300 max-sm:text-base sm:text-2xl md:text-3xl">
          :
        </span>
        <AnimatedNumber value={timeLeft.hours} label="Heures" />
        <span className="mb-6 text-lg font-bold text-slate-300 max-sm:text-base sm:text-2xl md:text-3xl">
          :
        </span>
        <AnimatedNumber value={timeLeft.minutes} label="Minutes" />
        <span className="mb-6 text-lg font-bold text-slate-300 max-sm:text-base sm:text-2xl md:text-3xl">
          :
        </span>
        <AnimatedNumber value={timeLeft.seconds} label="Secondes" />
      </div>

      <p className="mb-4 text-center text-xs leading-snug text-slate-600 sm:text-sm">
        <Trans i18nKey="event.countdown.description">
          Le compteur et le classement en direct
          <br />
          seront disponibles au lancement de l'évènement.
        </Trans>
      </p>

      <div className="btn-group mb-3 sm:mb-4">
        <ButtonLink
          className="mb-2 w-full text-sm sm:mb-3 sm:text-base lg:text-xl"
          size="xl"
          href={primaryCtaHref}>
          <Trans i18nKey="event.dynamicCounter.primaryCta">
            Je mobilise mon organisation
          </Trans>
        </ButtonLink>

        <ButtonLink
          className="w-full text-sm sm:text-base lg:text-xl"
          href={secondaryCtaHref}
          size="xl"
          color="secondary">
          <Trans i18nKey="event.dynamicCounter.secondaryCta">
            Je participe individuellement
          </Trans>
        </ButtonLink>
      </div>

      <p className="text-center text-xs text-slate-600">
        <Trans i18nKey="event.countdown.date">
          Lancement le 1er septembre 2026
        </Trans>
      </p>
    </div>
  )
}
