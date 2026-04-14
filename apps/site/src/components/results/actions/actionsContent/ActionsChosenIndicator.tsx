'use client'

import Trans from '@/components/translation/trans/TransClient'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { useCurrentSimulation } from '@/publicodes-state'

export default function ActionsChosenIndicator() {
  const { t } = useClientTranslation()

  const { actionChoices } = useCurrentSimulation()

  const count = Object.values(actionChoices).filter((a) => a === true).length

  if (count == 0) {
    return '.'
  }

  return (
    <span>
      ,{' '}
      <span className="mr-2 inline-block h-[1.8rem] w-[1.3rem] rounded-xs bg-[#77b255] text-center align-middle leading-[0.85rem] font-bold text-white">
        <div>{count}</div>
        <div title={t('actions choisies')}>&#10004;</div>
      </span>
      <Trans>sélectionnées</Trans>.
    </span>
  )
}
