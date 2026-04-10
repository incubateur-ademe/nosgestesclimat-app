import { roundValue } from '@/utils/roundValue'
import { formatValue } from 'publicodes'
import { twMerge } from 'tailwind-merge'
import Badge from '../layout/Badge'
import Card from '../layout/Card'
import Emoji from '../utils/Emoji'

interface Props {
  icons: string
  footprintAvoided: number
  title: string
  tag?: React.ElementType
  href?: string
  onClick?: () => void
  className?: string
}

export default function ActionCard({
  icons,
  footprintAvoided,
  title,
  tag = 'div',
  onClick = () => {},
  className,
  ...props
}: Props) {
  return (
    <Card
      tag={tag}
      onClick={onClick}
      className={twMerge('h-[140px] w-[230px] pr-2 no-underline!', className)}
      {...props}>
      <div className="flex justify-between">
        <Emoji className="flex gap-1">{icons}</Emoji>

        <Badge>
          <strong>
            - {formatValue(roundValue(footprintAvoided), { precision: 0 })}
          </strong>{' '}
          kg
        </Badge>
      </div>
      <p className="mt-4 pr-2 font-bold text-gray-950">{title}</p>
    </Card>
  )
}
