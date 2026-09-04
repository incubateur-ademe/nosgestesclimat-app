import LogoLink from '../../misc/LogoLink'

interface Props {
  rightContent?: React.ReactNode
}

export default function LogoHeader({ rightContent }: Props) {
  return (
    <div className="absolute top-0 right-0 bottom-0 left-0 h-20 w-full items-center border-b border-gray-200 bg-white shadow-xs md:flex">
      <div className="mx-auto flex h-full w-full max-w-5xl items-center justify-between gap-6 px-4 md:px-0">
        <div className="flex origin-left items-center justify-center">
          <LogoLink />
        </div>
        {rightContent && (
          <div className="flex h-full items-center">{rightContent}</div>
        )}
      </div>
    </div>
  )
}
