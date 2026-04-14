import Image from 'next/image'
import { twMerge } from 'tailwind-merge'

const imageClassSize = {
  xs: 'w-[24px]',
  sm: 'w-[38px]',
  md: 'w-[42px] md:w-[50px]',
}
const textClassSize = {
  xs: 'ml-1 text-xs',
  sm: 'ml-1 text-sm',
  md: 'ml-2 text-base md:text-lg',
}
interface Props {
  onClick?: () => void
  className?: string
  size?: 'xs' | 'sm' | 'md'
}
export default function Logo({ className, size = 'md' }: Props) {
  return (
    <div className={twMerge('flex items-center', className)}>
      <Image
        src="https://nosgestesclimat-prod.s3.fr-par.scw.cloud/cms/petit_logo_3x_f817f785ce.png"
        alt=""
        width="200"
        height="200"
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
