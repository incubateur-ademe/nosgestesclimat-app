'use client'

import Link from '@/components/Link'
import { cn } from 'cn'
import Image from 'next/image'
import type { ElementType, PropsWithChildren, ReactNode } from 'react'
import {
  baseClassNames,
  getVariantClassNames,
  sizeClassNames,
} from '../../design-system/buttons/Button'
import type { ButtonVariant } from '../../design-system/buttons/buttonStyles'
import Card from '../../design-system/layout/Card'

interface Props {
  href: string
  label: ReactNode
  icon?: ReactNode
  variant?: ButtonVariant
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
  variant = 'filled',
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
      className={cn(
        'bg-primary-50 border-primary-700 flex min-h-64 flex-col rounded-xl border p-6 no-underline',
        highlight ? 'rainbow-border' : '',
        className
      )}
      {...props}>
      <div className="mb-6 flex flex-1 items-center justify-center">
        <Image
          className={cn('self-start', imageClassName)}
          src={imageSrc}
          width={imageWidth}
          height={imageHeight}
          alt={imageAlt}
        />
      </div>

      <div
        className={cn(
          'w-full! text-sm',
          baseClassNames,
          sizeClassNames.md,
          getVariantClassNames(variant, 'primary'),
          ctaClassName
        )}>
        {icon}
        {label}
      </div>
    </Card>
  )
}
