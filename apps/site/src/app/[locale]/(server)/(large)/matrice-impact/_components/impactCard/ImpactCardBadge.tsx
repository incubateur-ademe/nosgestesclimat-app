import Trans from '@/components/translation/trans/TransServer'
import { cn } from 'cn'
import type { ImpactCardType } from '../../_types/type'

export default function ImpactCardBadge({
  type,
  className,
}: {
  type: ImpactCardType
  className: string
}) {
  const { classNames, label } = getBadgeProperties(type)
  return (
    <div
      className={cn(
        'mb-2 rounded-md border px-1 py-0.5 text-xs',
        classNames,
        className
      )}>
      {label}
    </div>
  )
}

function getBadgeProperties(type: ImpactCardType) {
  const classesByType = {
    usage: 'border-secondary-700 bg-secondary-50 text-secondary-700',
    impact: 'border-primary-700 bg-primary-50 text-primary-700',
    efficiency: 'border-green-700 bg-green-50 text-green-700',
  }
  const labelsByType = {
    usage: <Trans i18nKey="impact_matrix.badge.usage">Usage</Trans>,
    impact: <Trans i18nKey="impact_matrix.badge.impact">Impact</Trans>,
    efficiency: (
      <Trans i18nKey="impact_matrix.badge.efficiency">Efficience</Trans>
    ),
  }
  return {
    classNames: classesByType[type],
    label: labelsByType[type],
  }
}
