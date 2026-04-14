import Badge from '@/design-system/layout/Badge'
import Emoji from '@/design-system/utils/Emoji'
import { useRule } from '@/publicodes-state'
import type { DottedName } from '@incubateur-ademe/nosgestesclimat'
import { formatValue } from 'publicodes'
import ValueDiff from './pointsListItem/ValueDiff'

interface PointsListItemProps {
  name: DottedName
  value: number
  difference: number
}

export default function PointsListItem({
  name,
  value,
  difference,
}: PointsListItemProps) {
  const rule = useRule(name)
  return (
    <li className="mb-3 flex items-center justify-between rounded-md bg-[#F8F8F7] p-3 text-sm last:mb-0">
      <p className="mb-0 flex flex-col flex-wrap sm:gap-2">
        <span className="flex items-center gap-2">
          <Emoji className="text-lg">{rule.icons}</Emoji>

          {rule?.title}
        </span>

        <ValueDiff value={difference} />
      </p>

      <Badge>
        <strong>{formatValue(value, { precision: 0 })}</strong> kg
      </Badge>
    </li>
  )
}
