'use client'

import AnimatedCheckIcon from '@/components/icons/status/AnimatedCheckIcon'
import Trans from '@/components/translation/trans/TransClient'
import { END_PAGE_PATH } from '@/constants/urls/paths'
import ButtonLink from '@/design-system/buttons/ButtonLink'
import { motion } from 'framer-motion'

interface Props {
  organisationName: string
}

export default function EmailConfirmation({ organisationName }: Props) {
  return (
    <div className="bg-primary-100 mt-6 flex flex-col items-center justify-center rounded-2xl p-8">
      <div className="relative mb-6">
        {/* Halo */}
        <motion.div
          initial={{
            scale: 0,
            opacity: 1,
            borderRadius: '100%',
          }}
          animate={{
            scale: 2.4,
            opacity: 0,
            borderRadius: '100%',
          }}
          transition={{
            duration: 1.3,
            ease: [0.34, 1.4, 0.64, 1],
            delay: 0.6,
          }}
          className="bg-secondary-700/20 absolute inset-0 h-full w-full"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-secondary-700 relative z-10 flex h-16 w-16 items-center justify-center rounded-full shadow-lg">
          <AnimatedCheckIcon className="text-white" delay={0.6} />
        </motion.div>
      </div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 1 }}
        className="text-primary-700 mb-2 text-center text-lg leading-7 font-bold">
        <Trans i18nKey="emailConfirmation.title">Jeu concours -</Trans>{' '}
        {organisationName}{' '}
      </motion.h1>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 2 }}>
        <p className="mb-6! text-center text-2xl font-medium">
          <Trans i18nKey="emailConfirmation.subtitle">
            Votre participation a bien été prise en compte
          </Trans>
        </p>

        <p className="mb-6">
          <Trans i18nKey="emailConfirmation.text">
            Vous allez être redirigé vers vos résultats d’empreinte.
          </Trans>
        </p>

        <ButtonLink href={END_PAGE_PATH}>
          <Trans i18nKey="common.seeResults">Voir mes résultats</Trans>
          <span aria-hidden="true" className="ml-1">
            →
          </span>
        </ButtonLink>
      </motion.div>
    </div>
  )
}
