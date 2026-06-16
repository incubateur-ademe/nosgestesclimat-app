'use client'

import Trans from '@/components/translation/trans/TransClient'
import CarouselClient from '@/design-system/carousel/CarouselClient'
import ScrollReveal from '@/design-system/scroll-reveal/ScrollReveal'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { TutorialStep } from '../_helpers/eventPageData'
import StepCard from './eventTutorial/StepCard'
import Toggle, { type Mode } from './eventTutorial/Toggle'

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
}

const CONTAINER_VARIANTS = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.05 },
  },
  exit: {
    opacity: 1,
    transition: { staggerChildren: 0.05, staggerDirection: -1 as const },
  },
}

interface Props {
  stepsByMode: Record<string, TutorialStep[]>
}

export default function EventTutorial({ stepsByMode }: Props) {
  const [mode, setMode] = useState<Mode>('organisation')
  const { t } = useClientTranslation()

  const carouselTranslations = useMemo(
    () => ({
      prevSlideMessage: t(
        'event.tutorial.carousel.prevSlide',
        'Diapositive précédente'
      ),
      nextSlideMessage: t(
        'event.tutorial.carousel.nextSlide',
        'Diapositive suivante'
      ),
      firstSlideMessage: t(
        'event.tutorial.carousel.firstSlide',
        'Ceci est la première diapositive'
      ),
      lastSlideMessage: t(
        'event.tutorial.carousel.lastSlide',
        'Ceci est la dernière diapositive'
      ),
      paginationBulletMessage: t(
        'event.tutorial.carousel.paginationBullet',
        'Aller à la diapositive {{index}}'
      ),
      itemRoleDescriptionMessage: t(
        'event.tutorial.carousel.itemRole',
        'Diapositive'
      ),
    }),
    [t]
  )

  const steps = stepsByMode[mode]

  return (
    <ScrollReveal>
      {(inView) => (
        <section className="my-12 md:my-16">
          <h2 className="mb-8 text-center text-5xl leading-12 font-bold text-gray-900">
            <Trans i18nKey="event.tutorial.title">Comment participer ?</Trans>
          </h2>

          <div className="mb-8 text-center">
            <Toggle mode={mode} onChange={setMode} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              variants={CONTAINER_VARIANTS}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              exit="exit"
              className="hidden gap-6 md:grid md:grid-cols-3">
              {steps.map((step) => (
                <motion.div key={step.number} variants={CARD_VARIANTS}>
                  <StepCard step={step} />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}>
                <CarouselClient
                  translations={carouselTranslations}
                  className="px-4 py-1"
                  slideClassName="w-full max-w-none sm:w-full"
                  showMobileNav>
                  {steps.map((step) => (
                    <StepCard key={step.number} step={step} />
                  ))}
                </CarouselClient>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      )}
    </ScrollReveal>
  )
}
