import { twMerge } from 'tailwind-merge'

interface Props {
  rank: number
}

export default function RankBadge({ rank }: Props) {
  const isFirst = rank === 1

  return (
    <div
      className={twMerge(
        'mx-auto mb-4 flex size-16 items-center justify-center rounded-full text-xl font-medium',
        isFirst
          ? 'bg-secondary-700 text-2xl text-white'
          : 'bg-white text-gray-800'
      )}>
      {rank}
    </div>
  )
}
