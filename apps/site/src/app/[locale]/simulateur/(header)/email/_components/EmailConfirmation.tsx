'use client'

import { motion } from 'framer-motion'
import AnimatedCheckIcon from '@/components/icons/status/AnimatedCheckIcon'
import Trans from '@/components/translation/trans/TransClient'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { END_PAGE_PATH } from '@/constants/urls/paths'

interface Props {
  organisationName: string
}

export default function EmailConfirmation({ organisationName }: Props) {
  return (
    <div className="bg-primary-100 rounded-2xl p-8 flex flex-col items-center justify-center mt-6">
      <div className="relative mb-6">
        {/* Halo */}
        <motion.div
          initial={{
            scale: 0,
            opacity: 1,
            borderRadius: '100%'
          }}
          animate={{
            scale: 2.4,
            opacity: 0,
            borderRadius: '100%'
          }}
          transition={{
            duration: 1.3,
            ease: [0.34, 1.4, 0.64, 1],
            delay: 0.6,
          }}
          className="absolute inset-0 h-full w-full bg-secondary-700/20"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="h-16 w-16 rounded-full flex shadow-lg items-center justify-center bg-secondary-700 relative z-10">
          <AnimatedCheckIcon className="text-white" delay={0.6} />
        </motion.div>
      </div>

      <h1 className="mb-2 font-bold text-primary-700 text-lg leading-7">
        <Trans i18nKey="emailConfirmation.title">
          Jeu concours -
        </Trans>{' '}{organisationName}
      </h1>

      <p className='text-2xl font-medium mb-6'><Trans i18nKey="emailConfirmation.subtitle">Votre participation a bien été prise en compte</Trans></p>

      <p className="mb-6"><Trans i18nKey="emailConfirmation.text">Vous allez être redirigé vers vos résultats d’empreinte.</Trans></p>

      <ButtonLink href={END_PAGE_PATH}>
        <Trans i18nKey="common.seeResults">Voir mes résultats</Trans>
        <span aria-hidden="true" className="ml-1">
          →
        </span>
      </ButtonLink>
    </div>
  )
}
