import Trans from '@/components/translation/trans/TransServer'
import Badge, { type BadgeColor } from '@/design-system/layout/Badge'
import { cn } from 'cn'
import type { ImpactCardType } from '../../_types/type'

export default function ImpactCardBadge({
  type,
  className,
}: {
  type: ImpactCardType
  className: string
}) {
  const { color, label } = getBadgeProperties(type)
  return (
    <Badge
      color={color}
      className={cn('mb-2 rounded-md border px-1 py-0.5 text-xs', className)}>
      {label}
    </Badge>
  )
}

function getBadgeProperties(type: ImpactCardType): {
  color: Extract<BadgeColor, 'primary' | 'secondary' | 'green'>
  label: React.ReactNode
} {
  const typeColorMap = {
    usage: 'secondary',
    impact: 'primary',
    efficiency: 'green',
  } as const
  const labelsByType = {
    usage: <Trans i18nKey="impact_matrix.badge.usage">Usage</Trans>,
    impact: <Trans i18nKey="impact_matrix.badge.impact">Impact</Trans>,
    efficiency: (
      <Trans i18nKey="impact_matrix.badge.efficiency">Efficience</Trans>
    ),
  }
  return {
    color: typeColorMap[type],
    label: labelsByType[type],
  }
}
