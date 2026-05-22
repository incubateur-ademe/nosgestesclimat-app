import { twMerge } from 'tailwind-merge'
type Color = 'green' | 'red' | 'yellow'
interface Props extends React.PropsWithChildren {
  color: Color
}

const getColorClassName = (color: Color) => {
  switch (color) {
    case 'red':
      return 'bg-red-700'
    case 'yellow':
      return 'bg-yellow-700'
    default:
      return 'bg-green-700'
  }
}

export default function TiltedBadge({ children, color }: Props) {
  return (
    <div
      className={twMerge(
        'inline-block -rotate-6 rounded-full px-2 py-1 font-bold text-white',
        getColorClassName(color)
      )}>
      {children}
    </div>
  )
}
