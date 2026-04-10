'use client'

import Trans from '@/components/translation/trans/TransClient'
import { DEFAULT_FOCUS_ELEMENT_ID } from '@/constants/accessibility'
import Emoji from '@/design-system/utils/Emoji'
import { onKeyDownHelper } from '@/helpers/accessibility/onKeyDownHelper'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { motion } from 'framer-motion'
import { twMerge } from 'tailwind-merge'
import { useIsNotApplicableHack } from '../useIsNotApplicableHack'

interface Props {
  question: DottedName
  title?: string
  icons?: string
  description?: string
  setValue: (value: boolean) => void
  value: boolean | undefined | null
  index: number
  isInactive?: boolean
}

const buttonClassNames = {
  inactive:
    'border-slate-500 text-primary-700 cursor-default border-2 bg-gray-100',
  checked: 'border-primary-700 text-primary-700 border-2 cursor-pointer ',
  unchecked: 'border-slate-500 hover:bg-primary-50 border-2 cursor-pointer ',
}
const checkClassNames = {
  inactive: 'border-slate-400',
  checked: 'border-primary-700',
  unchecked: 'border-slate-400',
}

export default function MosaicBooleanInput({
  question,
  title,
  icons,
  description,
  setValue,
  index,
  value,
  isInactive,
}: Props) {
  const { t } = useClientTranslation()

  const isNotApplicableOption = useIsNotApplicableHack(question)

  if (isNotApplicableOption) {
    return null
  }

  const status = isInactive
    ? 'inactive'
    : value === true
      ? 'checked'
      : 'unchecked'

  const onClick = () => {
    setValue(!value)
  }

  return (
    <div>
      <label
        data-testid={`${question}-oui-label`}
        className={twMerge(
          `focus-within:ring-primary-700 relative flex h-full items-center gap-2 rounded-xl border! bg-white px-4 py-2 text-left transition-colors focus-within:ring-2 focus-within:ring-offset-2`,
          buttonClassNames[status]
        )}
        title={`${title} - ${status === 'checked' ? t('Sélectionné') : t('Sélectionner cette option')}`}>
        <input
          type="checkbox"
          data-testid={`${question}-oui`}
          aria-disabled={isInactive}
          aria-describedby={isInactive ? `${title}-soon-available` : undefined}
          className="sr-only"
          onChange={() => {
            if (isInactive) return
            onClick()
          }}
          onKeyDown={!isInactive ? onKeyDownHelper(() => onClick()) : undefined}
          id={`${DEFAULT_FOCUS_ELEMENT_ID}-${index}`}
          checked={!!value}
        />

        <span
          className={`${checkClassNames[status]} flex h-5 w-5 items-center justify-center rounded-xs border-2 leading-4`}>
          {status === 'checked' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="text-primary-700 font-mono text-2xl">
              ✓
            </motion.div>
          ) : (
            ''
          )}
        </span>

        <div className="flex-1">
          {title ? (
            <span
              aria-label={`${title} ${isInactive ? t('Bientôt disponible') : ''}`}
              className="inline-block align-middle text-sm md:text-base">
              {title}{' '}
              {icons && <Emoji className="leading-tight">{icons}</Emoji>}
            </span>
          ) : null}
          {description ? (
            <p className="mb-0 text-xs italic md:text-sm">
              {description.split('\n')[0]}
            </p>
          ) : null}
        </div>
        {isInactive ? (
          <p
            id={`${title}-soon-available`}
            className="border-secondary-200 bg-secondary-50 text-secondary-800 absolute right-1 mb-0 flex items-center justify-center rounded-xl border-2 px-1.5 py-1 text-xs font-semibold md:-bottom-4">
            <Trans>Bientôt disponible</Trans>
          </p>
        ) : null}
      </label>
    </div>
  )
}
