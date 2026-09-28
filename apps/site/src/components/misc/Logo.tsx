import Image from 'next/image'
import { twMerge } from "cn";

const imageClassSize = {
  xs: 'w-6',
  sm: 'w-9.5',
  md: 'w-10.5 max-tiny:w-8 md:w-12.5',
}
const textClassSize = {
  xs: 'ml-1 text-xs',
  sm: 'ml-1 text-sm',
  md: 'ml-2 text-base max-tiny:ml-1 max-tiny:text-xs md:text-lg',
}
interface Props {
  onClick?: () => void
  className?: string
  size?: 'xs' | 'sm' | 'md'
  /**
   * Request the logo from `/_static/cms` instead of `/_next/image`. Set it when
   * the logo must render while the app is down (`/_next/image` is part of the
   * app): nginx serves `/_static/cms` from S3.
   */
  unoptimized?: boolean
}
export default function Logo({ className, size = 'md', unoptimized }: Props) {
  return (
    <div className={twMerge('flex items-center', className)}>
      <Image
        src="/_static/cms/petit_logo_3x_f817f785ce.png"
        alt=""
        width="200"
        height="200"
        unoptimized={unoptimized}
        className={twMerge('h-auto', imageClassSize[size])}
      />

      <div
        className={twMerge(
          'text-default origin-left leading-[0.85]! font-extrabold uppercase transition-all duration-500 lg:block',
          textClassSize[size]
        )}>
        <span className="block w-full leading-[0.85]! whitespace-normal">
          Nos
        </span>
        <span className="block w-full leading-[0.85]! whitespace-normal">
          Gestes
        </span>
        <span className="block w-full leading-[0.85]! whitespace-normal">
          Climat
        </span>
      </div>
    </div>
  )
}
