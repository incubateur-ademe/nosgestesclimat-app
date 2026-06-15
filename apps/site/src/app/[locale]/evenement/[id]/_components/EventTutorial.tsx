'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import CarouselClient from '@/design-system/carousel/CarouselClient'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepCard({ step }: { step: Step }) {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-sm">
      <span className="mb-4 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
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
    <div className="mx-auto mb-10 inline-flex rounded-full bg-gray-100 p-1">
      {(['organisation', 'individu'] as const).map((value) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className={twMerge(
            'rounded-full px-6 py-2 text-sm font-medium transition-colors',
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

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EventTutorial() {
  const [mode, setMode] = useState<Mode>('organisation')

  const steps = STEPS_DATA[mode]

  return (
    <section className="my-16">
      <h2 className="mb-2 text-center text-5xl leading-12 font-bold text-gray-900">
        Comment participer ?
      </h2>

      <Toggle mode={mode} onChange={setMode} />

      {/* ---- Desktop: side-by-side cards ---- */}
      <div className="hidden gap-6 md:grid md:grid-cols-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="contents">
            {steps.map((step) => (
              <StepCard key={step.number} step={step} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---- Mobile: carousel ---- */}
      <div className="md:hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}>
            <CarouselClient
              translations={CAROUSEL_TRANSLATIONS}
              className="py-1 px-4"
              slideClassName="w-full max-w-none sm:w-full">
              {steps.map((step) => (
                <StepCard key={step.number} step={step} />
              ))}
            </CarouselClient>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
