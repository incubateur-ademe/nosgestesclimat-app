'use client'

import { carboneMetric, eauMetric } from '@/constants/model/metric'
import Button from '@/design-system/buttons/Button'
import Emoji from '@/design-system/utils/Emoji'
import { useClientTranslation } from '@/hooks/useClientTranslation'
import type { Metric } from '@/publicodes-state/types'

interface Props {
  metric: Metric
  setMetric: (metric: Metric) => void
}

export default function MetricSwitchButton({ metric, setMetric }: Props) {
  const { t } = useClientTranslation()

  return (
    <ul className="mb-2 flex justify-center gap-2 lg:justify-end">
      <li>
        <Button
          color={metric === carboneMetric ? 'primary' : 'secondary'}
          onClick={() => setMetric(carboneMetric)}
          size="sm"
          aria-label={t('Carbone, évaluer la métrique carbone')}
          title={`${t('Carbone, évaluer la métrique carbone')} - ${metric === carboneMetric ? t('Page active') : t('Visiter cette page')}`}
          className="flex items-center gap-2 px-4 py-3">
          <span>Carbone</span> <Emoji>⚫️</Emoji>
        </Button>
      </li>
      <li>
        <Button
          color={metric === eauMetric ? 'primary' : 'secondary'}
          onClick={() => setMetric(eauMetric)}
          size="sm"
          aria-label={t('Eau, évaluer la métrique eau')}
          title={`${t('Eau, évaluer la métrique eau')} - ${metric === eauMetric ? t('Page active') : t('Visiter cette page')}`}
          className="flex items-center gap-2 px-4 py-3">
          <span>Eau</span> <Emoji>💧</Emoji>
        </Button>
      </li>
    </ul>
  )
}
