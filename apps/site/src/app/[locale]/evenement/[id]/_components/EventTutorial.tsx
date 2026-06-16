'use client'

import CarouselClient from '@/design-system/carousel/CarouselClient'
import ScrollReveal from '@/design-system/scroll-reveal/ScrollReveal'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

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

type Mode = 'organisation' | 'individu'

interface Step {
  number: number
  title: string
  description: string
}

const STEPS_DATA: Record<Mode, Step[]> = {
  organisation: [
    {
      number: 1,
      title: 'Créez un test collectif',
      description:
        'Configurez votre campagne en quelques clics et définissez vos objectifs.',
    },
    {
      number: 2,
      title: 'Partagez le lien',
      description:
        'Diffusez un lien unique par email, réseau social ou QR code auprès de vos collaborateurs.',
    },
    {
      number: 3,
      title: 'Suivez les résultats',
      description:
        'Visualisez en temps réel les participations et l’empreinte carbone collective.',
    },
  ],
  individu: [
    {
      number: 1,
      title: 'Répondez aux questions',
      description:
        'Parcourez les thématiques (alimentation, transport, logement…) en quelques minutes.',
    },
    {
      number: 2,
      title: 'Résultat instantané',
      description:
        'Découvrez votre empreinte carbone personnelle détaillée par catégorie.',
    },
    {
      number: 3,
      title: 'Passez à l’action',
      description:
        'Recevez des actions personnalisées pour réduire votre impact au quotidien.',
    },
  ],
}

const CAROUSEL_TRANSLATIONS = {
  prevSlideMessage: 'Étape précédente',
  nextSlideMessage: 'Étape suivante',
  firstSlideMessage: 'Ceci est la première étape',
  lastSlideMessage: 'Ceci est la dernière étape',
  paginationBulletMessage: 'Aller à l’étape {{index}}',
  itemRoleDescriptionMessage: 'Étape',
}

function StepCard({ step }: { step: Step }) {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm">
      <span className="bg-secondary-700 mb-4 flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white">
        {step.number}
      </span>
      <h3 className="mb-2 text-lg font-bold text-gray-800">{step.title}</h3>
      <p className="text-sm leading-relaxed text-gray-600">
        {step.description}
      </p>
    </div>
  )
}

function Toggle({
  mode,
  onChange,
}: {
  mode: Mode
  onChange: (mode: Mode) => void
}) {
  return (
    <div className="mx-auto inline-flex rounded-full bg-gray-100 p-1">
      {(['organisation', 'individu'] as const).map((value) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={twMerge(
            'rounded-full px-6 py-3 text-sm font-medium transition-colors',
            mode === value
              ? 'bg-primary-700 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}>
          {value === 'organisation' ? 'Organisation' : 'Individu'}
        </button>
      ))}
    </div>
  )
}

export default function EventTutorial() {
  const [mode, setMode] = useState<Mode>('organisation')

  const steps = STEPS_DATA[mode]

  return (
    <ScrollReveal>
      {(inView) => (
        <section className="my-12 md:my-16">
          <h2 className="mb-8 text-center text-5xl leading-12 font-bold text-gray-900">
            Comment participer ?
          </h2>

          <div className="mb-8 text-center">
            <Toggle mode={mode} onChange={setMode} />
          </div>

          {/* ---- Desktop: side-by-side cards ---- */}
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

          {/* ---- Mobile: carousel ---- */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: 12 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}>
                <CarouselClient
                  translations={CAROUSEL_TRANSLATIONS}
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
