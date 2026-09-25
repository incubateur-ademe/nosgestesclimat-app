import Link from '@/design-system/links/Link'
import Logo from './Logo'
import { twMerge } from "cn";

interface Props {
  onClick?: () => void
  className?: string
  size?: 'sm' | 'md'
  unoptimized?: boolean
}
export default function LogoLink({
  className,
  size = 'md',
  unoptimized,
}: Props) {
  return (
    <div className={twMerge('flex items-center', className)}>
      <Link
        href="/"
        data-testid="home-logo-link"
        className="flex items-center justify-center no-underline">
        <Logo size={size} unoptimized={unoptimized} />
      </Link>
    </div>
  )
}
