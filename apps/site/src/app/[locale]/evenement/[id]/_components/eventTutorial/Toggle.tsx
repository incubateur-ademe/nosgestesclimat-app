'use client'

import { t } from '@/helpers/metadata/fakeMetadataT'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import { twMerge } from 'tailwind-merge'

export type Mode = 'organisation' | 'individu'

const MODE_LABELS: Record<Mode, string> = {
  organisation: t('Organisation'),
  individu: t('Individu'),
}

interface Props {
  mode: Mode
  onChange: (mode: Mode) => void
}

export default function Toggle({ mode, onChange }: Props) {
  const { t } = useClientTranslation()

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
          {t(MODE_LABELS[value])}
        </button>
      ))}
    </div>
  )
}
