'ue client'

import { useClientTranslation } from '@/hooks/useClientTranslation'
import { formatValue } from 'publicodes'
import { twMerge } from 'tailwind-merge'

export default function ValueDiff({ value }: { value: number }) {
  const { t } = useClientTranslation()

  return (
    <span
      className={twMerge(
        'inline-block text-xs',
        Math.round(value) !== 0 && value > 0
          ? 'text-red-600'
          : 'text-green-700',
        Math.round(value) === 0 && 'text-gray-700'
      )}>
      {Math.round(value) === 0 && <span>= {t('à la moyenne du groupe')}</span>}
      {Math.round(value) !== 0 && (
        <span>
          <strong>
            {formatValue(Math.abs(value), { precision: 0 })} kg {t('de')}{' '}
            {value < 0 ? t('moins') : t('plus')}
          </strong>{' '}
          {t('que la moyenne du groupe')}
        </span>
      )}
    </span>
  )
}
