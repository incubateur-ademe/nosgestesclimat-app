import { twMerge } from 'tailwind-merge'

interface Props extends React.PropsWithChildren {
  color: 'green' | 'red'
}

export default function TiltedBadge({ children, color }: Props) {
  return (
    <div
      className={twMerge(
        'inline-block -rotate-6 rounded-full px-2 py-1 font-bold text-white',
        color === 'green' ? 'bg-green-700' : 'bg-red-700'
      )}>
      {children}
    </div>
  )
}
