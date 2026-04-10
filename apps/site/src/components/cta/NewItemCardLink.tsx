'use client'

import Link from '@/components/Link'
import Image from 'next/image'
import type { ElementType, PropsWithChildren, ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'
import {
  baseClassNames,
  colorClassNames,
  sizeClassNames,
} from '../../design-system/buttons/Button'
import Card from '../../design-system/layout/Card'

interface Props {
  href: string
  label: ReactNode
  icon?: ReactNode
  color?: 'primary' | 'secondary'
  highlight?: boolean
  className?: string
  imageSrc: string
  imageAlt: string
  imageWidth?: number | `${number}`
  imageHeight?: number | `${number}`
  imageClassName?: string
  ctaClassName?: string
  tag?: ElementType
  target?: string
}

export default function NewItemCardLink({
  href,
  label,
  icon,
  color = 'primary',
  highlight = false,
  className,
  imageSrc,
  imageAlt,
  imageWidth = 200,
  imageHeight = 400,
  imageClassName,
  ctaClassName,
  tag = Link,
  target,
  ...props
}: PropsWithChildren<Props>) {
  return (
    <Card
      tag={tag}
      href={href}
      target={target}
      className={twMerge(
        'bg-primary-50 border-primary-700 flex min-h-64 flex-col rounded-xl border p-6 no-underline',
        highlight ? 'rainbow-border' : '',
        className
      )}
      {...props}>
      <div className="mb-6 flex flex-1 items-center justify-center">
        <Image
          className={twMerge('self-start', imageClassName)}
          src={imageSrc}
          width={imageWidth}
          height={imageHeight}
          alt={imageAlt}
        />
      </div>

      <div
        className={twMerge(
          'w-full! text-sm',
          baseClassNames,
          sizeClassNames.md,
          colorClassNames[color],
          ctaClassName
        )}>
        {icon}
        {label}
      </div>
    </Card>
  )
}
