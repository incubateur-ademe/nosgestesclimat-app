import { twMerge } from 'tailwind-merge'

type PodiumItem = {
  rank: number
  label: string
  score?: string
}

interface Props {
  items: PodiumItem[]
  className?: string
}

function RankBadge({
  rank,
  variant,
}: {
  rank: number
  variant: 'gold' | 'silver' | 'bronze'
}) {
  const isFirst = variant === 'gold'

  return (
    <div
      className={twMerge(
        'mx-auto mb-3 flex size-10 items-center justify-center rounded-full text-lg font-extrabold',
        isFirst ? 'bg-secondary-700 text-white' : 'bg-white text-gray-800'
      )}>
      {rank}
    </div>
  )
}

const heightClasses = {
  gold: 'h-40 md:h-52',
  silver: 'h-32 md:h-40',
  bronze: 'h-28 md:h-36',
} as const

const orderClasses = {
  gold: 'order-1 md:order-2',
  silver: 'order-2 md:order-1',
  bronze: 'order-3',
} as const

function PodiumBlock({
  rank,
  label,
  score,
  variant,
}: PodiumItem & { variant: 'gold' | 'silver' | 'bronze' }) {
  const isFirst = variant === 'gold'

  return (
    <div
      className={twMerge(
        'flex flex-col items-center justify-start px-4 pt-5',
        'rounded-xl md:rounded-t-xl md:rounded-b-none',
        'w-full md:flex-1',
        heightClasses[variant],
        orderClasses[variant],
        isFirst ? 'bg-primary-700 text-white' : 'bg-primary-100 text-gray-800'
      )}>
      <RankBadge rank={rank} variant={variant} />
      <span className="text-center text-sm leading-tight font-bold">
        {label}
      </span>
      {score && <span className="mt-1 text-xs opacity-70">{score}</span>}
    </div>
  )
}

function ListItem({ rank, label, score }: PodiumItem) {
  return (
    <li className="border-primary-700 flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
      <span className="bg-primary-100 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-gray-800">
        {rank}
      </span>
      <span className="flex-1 text-sm font-bold text-gray-800">{label}</span>
      {score && <span className="text-xs text-gray-500">{score}</span>}
    </li>
  )
}

export default function PodiumVisual({ items, className }: Props) {
  const podiumItems = items.slice(0, 3)
  const remainingItems = items.slice(3, 10)

  const variants = ['gold', 'silver', 'bronze'] as const

  return (
    <ol className={twMerge('mt-6 list-none', className)}>
      {/* Podium */}
      <li className="mb-3 md:mb-0">
        <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-end md:justify-center md:gap-0">
          {podiumItems.map(
            (item, i) =>
              item && (
                <PodiumBlock key={item.rank} {...item} variant={variants[i]} />
              )
          )}
        </div>
      </li>

      {/* Remaining rankings */}
      {remainingItems.length > 0 && (
        <li>
          <div className="border-primary-700 overflow-hidden rounded-xl border">
            <ol start={4} className="list-none">
              {remainingItems.map((item) => (
                <ListItem key={item.rank} {...item} />
              ))}
            </ol>
          </div>
        </li>
      )}
    </ol>
  )
}
