import Image from 'next/image'
import type { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import Badge from '../layout/Badge'

export default function ImageWithCategory({
  imageSrc,
  imageAlt,
  width = 320,
  height = 240,
  imageClassName,
  containerClassName,
  category,
  hideBadgeOnMobile = true,
}: {
  imageSrc: string
  imageAlt: string
  width?: number | `${number}`
  height?: number | `${number}`
  imageClassName?: string
  containerClassName?: string
  category: ReactNode | string
  hideBadgeOnMobile?: boolean
}) {
  return (
    <div className={twMerge('relative', containerClassName)}>
      <Image
        src={imageSrc ?? null}
        alt={imageAlt ?? ''}
        width={width}
        height={height}
        className={twMerge(
          'h-full w-full rounded-xl object-cover',
          imageClassName
        )}
      />

      {/* Hidden on mobile */}
      <div
        className={twMerge(
          'absolute top-2 left-2 md:block',
          hideBadgeOnMobile ? 'hidden' : 'block'
        )}>
        <Badge className="inline-block text-xs">{category}</Badge>
      </div>
    </div>
  )
}
